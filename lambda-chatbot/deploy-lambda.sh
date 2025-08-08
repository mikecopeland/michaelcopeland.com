#!/bin/bash

# Configuration
FUNCTION_NAME="portfolio-chatbot"
REGION="us-east-1"
RUNTIME="nodejs18.x"
HANDLER="index.handler"
ROLE_NAME="portfolio-chatbot-role"
TABLE_NAME="ChatHistory"

echo "🚀 Deploying Portfolio Chatbot Lambda Function..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"

echo "📦 Installing dependencies..."
npm install

echo "📝 Creating DynamoDB table..."
aws dynamodb create-table \
    --table-name $TABLE_NAME \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=sessionId,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=sessionId,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region $REGION \
    2>/dev/null || echo "Table already exists"

echo "🔐 Creating IAM role..."
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "lambda.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }' \
    2>/dev/null || echo "Role already exists"

# Attach policies to the role
echo "📋 Attaching policies to role..."
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Wait for role to be ready
echo "⏳ Waiting for IAM role to be ready..."
sleep 10

echo "📦 Creating deployment package..."
zip -r chatbot-lambda.zip . -x "*.git*" "node_modules/.cache/*" "deploy-lambda.sh" "*.md"

echo "🚀 Creating/updating Lambda function..."
aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime $RUNTIME \
    --role $ROLE_ARN \
    --handler $HANDLER \
    --zip-file fileb://chatbot-lambda.zip \
    --timeout 30 \
    --memory-size 256 \
    --region $REGION \
    --environment Variables='{
        "OPENAI_API_KEY": "your-openai-api-key-here"
    }' \
    2>/dev/null || {
        echo "Function exists, updating code..."
        aws lambda update-function-code \
            --function-name $FUNCTION_NAME \
            --zip-file fileb://chatbot-lambda.zip \
            --region $REGION
    }

echo "🌐 Creating API Gateway..."
# Create API Gateway (this is a simplified version - you might want to use AWS CDK or CloudFormation for production)
API_ID=$(aws apigatewayv2 create-api \
    --name portfolio-chatbot-api \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins="*",AllowMethods="GET,POST,OPTIONS",AllowHeaders="*" \
    --query ApiId \
    --output text \
    2>/dev/null || aws apigatewayv2 get-apis --query "Items[?Name=='portfolio-chatbot-api'].ApiId" --output text)

if [ "$API_ID" != "" ] && [ "$API_ID" != "None" ]; then
    echo "✅ API Gateway created/found: $API_ID"
    
    # Create integration
    aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-uri arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/arn:aws:lambda:$REGION:$ACCOUNT_ID:function:$FUNCTION_NAME/invocations \
        --payload-format-version 2.0 \
        2>/dev/null || echo "Integration may already exist"
    
    # Create route
    aws apigatewayv2 create-route \
        --api-id $API_ID \
        --route-key "POST /chat" \
        --target integrations/$(aws apigatewayv2 get-integrations --api-id $API_ID --query "Items[0].IntegrationId" --output text) \
        2>/dev/null || echo "Route may already exist"
    
    # Create stage
    aws apigatewayv2 create-stage \
        --api-id $API_ID \
        --stage-name prod \
        --auto-deploy \
        2>/dev/null || echo "Stage may already exist"
    
    # Add permission for API Gateway to invoke Lambda
    aws lambda add-permission \
        --function-name $FUNCTION_NAME \
        --statement-id apigateway-invoke \
        --action lambda:InvokeFunction \
        --principal apigateway.amazonaws.com \
        --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*" \
        2>/dev/null || echo "Permission may already exist"
    
    API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
    echo "🎉 Deployment complete!"
    echo "🔗 API Gateway URL: $API_URL/chat"
else
    echo "❌ Failed to create API Gateway"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Set your OpenAI API key:"
echo "   aws lambda update-function-configuration --function-name $FUNCTION_NAME --environment Variables='{\"OPENAI_API_KEY\":\"your-actual-api-key\"}'"
echo ""
echo "2. Update your Angular service to use:"
echo "   API_URL: $API_URL/chat"
echo ""
echo "3. Test the endpoint:"
echo "   curl -X POST $API_URL/chat -H \"Content-Type: application/json\" -d '{\"message\":\"Hello!\"}'"

# Clean up
rm -f chatbot-lambda.zip

