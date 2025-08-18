#!/bin/bash

# Contact Form Lambda Deployment Script
set -e

echo "🚀 Deploying Contact Form Lambda Function..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi
echo "✅ AWS CLI configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r contact-form-lambda.zip index.js package.json node_modules/

# Create Lambda function if it doesn't exist
FUNCTION_NAME="portfolio-contact-form"

if aws lambda get-function --function-name $FUNCTION_NAME &> /dev/null; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://contact-form-lambda.zip
else
    echo "🆕 Creating new Lambda function..."
    
    # Create IAM role for Lambda
    ROLE_NAME="portfolio-contact-form-role"
    
    if ! aws iam get-role --role-name $ROLE_NAME &> /dev/null; then
        echo "🔧 Creating IAM role..."
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
            }'
        
        # Attach basic execution role
        aws iam attach-role-policy \
            --role-name $ROLE_NAME \
            --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        
        # Attach SES permissions
        aws iam put-role-policy \
            --role-name $ROLE_NAME \
            --policy-name SESPermissions \
            --policy-document '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "ses:SendEmail",
                            "ses:SendRawEmail"
                        ],
                        "Resource": "*"
                    }
                ]
            }'
        
        # Attach DynamoDB permissions
        aws iam put-role-policy \
            --role-name $ROLE_NAME \
            --policy-name DynamoDBPermissions \
            --policy-document '{
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Action": [
                            "dynamodb:PutItem",
                            "dynamodb:GetItem",
                            "dynamodb:UpdateItem",
                            "dynamodb:DeleteItem",
                            "dynamodb:Query",
                            "dynamodb:Scan"
                        ],
                        "Resource": "arn:aws:dynamodb:us-east-1:*:table/ContactSubmissions"
                    }
                ]
            }'
        
        # Wait for role to be available
        echo "⏳ Waiting for IAM role to be available..."
        sleep 10
    fi
    
    # Get role ARN
    ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
    
    # Create Lambda function
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime nodejs18.x \
        --role $ROLE_ARN \
        --handler index.handler \
        --zip-file fileb://contact-form-lambda.zip \
        --description "Contact form submission handler" \
        --timeout 30 \
        --memory-size 256 \
        --environment Variables='{
            "FROM_EMAIL": "noreply@michaelcopeland.com",
            "TO_EMAIL": "michael@michaelcopeland.com"
        }'
fi

# Create DynamoDB table if it doesn't exist
TABLE_NAME="ContactSubmissions"

if ! aws dynamodb describe-table --table-name $TABLE_NAME &> /dev/null; then
    echo "🆕 Creating DynamoDB table..."
    aws dynamodb create-table \
        --table-name $TABLE_NAME \
        --attribute-definitions AttributeName=submissionId,AttributeType=S \
        --key-schema AttributeName=submissionId,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST
fi

# Create API Gateway if it doesn't exist
API_NAME="portfolio-contact-api"

if ! aws apigatewayv2 get-apis --query "Items[?Name=='$API_NAME'].ApiId" --output text | grep -q .; then
    echo "🆕 Creating API Gateway..."
    API_ID=$(aws apigatewayv2 create-api \
        --name $API_NAME \
        --protocol-type HTTP \
        --target "arn:aws:lambda:us-east-1:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME" \
        --query 'ApiId' --output text)
    
    # Create integration
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
        --api-id $API_ID \
        --integration-type AWS_PROXY \
        --integration-uri "arn:aws:lambda:us-east-1:$(aws sts get-caller-identity --query Account --output text):function:$FUNCTION_NAME" \
        --integration-method POST \
        --payload-format-version 2.0 \
        --query 'IntegrationId' --output text)
    
    # Create route
    aws apigatewayv2 create-route \
        --api-id $API_ID \
        --route-key "POST /contact" \
        --target "integrations/$INTEGRATION_ID"
    
    # Deploy to prod stage
    aws apigatewayv2 create-stage \
        --api-id $API_ID \
        --stage-name prod \
        --auto-deploy true
    
    echo "🎉 API Gateway created: https://$API_ID.execute-api.us-east-1.amazonaws.com/prod/contact"
else
    echo "✅ API Gateway already exists"
fi

echo "🎉 Contact Form Lambda deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify SES email addresses are verified"
echo "2. Test the contact form endpoint"
echo "3. Update Angular service to use the new endpoint"
