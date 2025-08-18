#!/bin/bash

# Login Tracking Lambda Deployment Script
set -e

echo "🚀 Deploying Login Tracking Lambda Function..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create deployment package
echo "📦 Creating deployment package..."
zip -r login-tracking-lambda.zip index.js package.json node_modules/

# Create DynamoDB table for login events
echo "🗄️ Creating DynamoDB table for login events..."
aws dynamodb create-table \
    --table-name LoginEvents \
    --attribute-definitions AttributeName=eventId,AttributeType=S \
    --key-schema AttributeName=eventId,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-1 2>/dev/null || echo "Table already exists or error occurred"

# Create Lambda function
echo "🔧 Creating Lambda function..."
aws lambda create-function \
    --function-name portfolio-login-tracking \
    --runtime nodejs18.x \
    --role arn:aws:iam::493811370553:role/portfolio-contact-form-role \
    --handler index.handler \
    --zip-file fileb://login-tracking-lambda.zip \
    --description "Track user logins for portfolio analytics" \
    --timeout 30 \
    --memory-size 256 \
    --region us-east-1 2>/dev/null || echo "Function already exists, updating..."

# Update function code if it already exists
if [ $? -ne 0 ]; then
    echo "🔄 Updating existing Lambda function..."
    aws lambda update-function-code \
        --function-name portfolio-login-tracking \
        --zip-file fileb://login-tracking-lambda.zip \
        --region us-east-1
fi

# Create API Gateway for login tracking
echo "🌐 Creating API Gateway for login tracking..."
API_ID=$(aws apigatewayv2 create-api \
    --name "portfolio-login-tracking-api" \
    --protocol-type HTTP \
    --region us-east-1 \
    --query 'ApiId' \
    --output text 2>/dev/null || echo "API already exists")

if [ "$API_ID" = "API already exists" ]; then
    echo "🔄 Using existing API Gateway..."
    API_ID=$(aws apigatewayv2 get-apis \
        --region us-east-1 \
        --query 'Items[?Name==`portfolio-login-tracking-api`].ApiId' \
        --output text)
else
    echo "✅ Created API Gateway: $API_ID"
fi

# Create integration
echo "🔗 Creating API Gateway integration..."
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri "arn:aws:lambda:us-east-1:493811370553:function:portfolio-login-tracking" \
    --integration-method POST \
    --payload-format-version "2.0" \
    --region us-east-1 \
    --query 'IntegrationId' \
    --output text 2>/dev/null || echo "Integration already exists")

if [ "$INTEGRATION_ID" = "Integration already exists" ]; then
    echo "🔄 Using existing integration..."
    INTEGRATION_ID=$(aws apigatewayv2 get-integrations \
        --api-id $API_ID \
        --region us-east-1 \
        --query 'Items[0].IntegrationId' \
        --output text)
else
    echo "✅ Created integration: $INTEGRATION_ID"
fi

# Create routes
echo "🛣️ Creating API Gateway routes..."
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /track" \
    --target "integrations/$INTEGRATION_ID" \
    --region us-east-1 2>/dev/null || echo "Route already exists"

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "OPTIONS /track" \
    --target "integrations/$INTEGRATION_ID" \
    --region us-east-1 2>/dev/null || echo "Route already exists"

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /analytics" \
    --target "integrations/$INTEGRATION_ID" \
    --region us-east-1 2>/dev/null || echo "Route already exists"

aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "OPTIONS /analytics" \
    --target "integrations/$INTEGRATION_ID" \
    --region us-east-1 2>/dev/null || echo "Route already exists"

# Deploy API
echo "🚀 Deploying API Gateway..."
aws apigatewayv2 create-deployment \
    --api-id $API_ID \
    --region us-east-1

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api \
    --api-id $API_ID \
    --region us-east-1 \
    --query 'ApiEndpoint' \
    --output text)

echo "✅ Login tracking API deployed successfully!"
echo "🌐 API Endpoint: $API_ENDPOINT"
echo "📊 Track login: POST $API_ENDPOINT/track"
echo "📈 Get analytics: POST $API_ENDPOINT/analytics"

# Add Lambda permissions for API Gateway
echo "🔐 Adding Lambda permissions..."
aws lambda add-permission \
    --function-name portfolio-login-tracking \
    --statement-id apigateway-invoke-login-tracking \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:493811370553:$API_ID/*/*/*" \
    --region us-east-1 2>/dev/null || echo "Permission already exists"

echo "🎉 Login tracking deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your Angular app to call the tracking API on login"
echo "2. Create an analytics dashboard component"
echo "3. Test the tracking functionality"
