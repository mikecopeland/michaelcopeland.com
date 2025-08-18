#!/bin/bash

# Deploy SNS Contact Form Lambda Function
# This script sets up SNS topics and deploys the Lambda function

set -e

echo "🚀 Deploying SNS Contact Form Lambda Function..."

# Configuration
FUNCTION_NAME="contact-form-sns-lambda"
ROLE_NAME="contact-form-sns-lambda-role"
POLICY_NAME="contact-form-sns-lambda-policy"
TOPIC_NAME="contact-form-notifications"
SMS_TOPIC_NAME="contact-form-sms-notifications"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}📁 Creating deployment package...${NC}"
zip -r function.zip index.js node_modules package.json

echo -e "${YELLOW}🔧 Creating IAM role...${NC}"
# Create the role
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
    }' 2>/dev/null || echo "Role already exists"

# Attach basic Lambda execution policy
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

echo -e "${YELLOW}📝 Creating SNS policy...${NC}"
# Create SNS policy
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "sns:Publish"
                ],
                "Resource": "*"
            }
        ]
    }' 2>/dev/null || echo "Policy already exists"

# Attach SNS policy to role
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):policy/$POLICY_NAME

echo -e "${YELLOW}📧 Creating SNS topics...${NC}"
# Create email topic
EMAIL_TOPIC_ARN=$(aws sns create-topic --name $TOPIC_NAME --query 'TopicArn' --output text 2>/dev/null || \
    aws sns list-topics --query "Topics[?contains(TopicArn, '$TOPIC_NAME')].TopicArn" --output text)

# Create SMS topic (optional)
SMS_TOPIC_ARN=$(aws sns create-topic --name $SMS_TOPIC_NAME --query 'TopicArn' --output text 2>/dev/null || \
    aws sns list-topics --query "Topics[?contains(TopicArn, '$SMS_TOPIC_NAME')].TopicArn" --output text)

echo -e "${GREEN}✅ Email Topic ARN: $EMAIL_TOPIC_ARN${NC}"
echo -e "${GREEN}✅ SMS Topic ARN: $SMS_TOPIC_ARN${NC}"

# Wait for role to be available
echo -e "${YELLOW}⏳ Waiting for IAM role to be available...${NC}"
sleep 10

echo -e "${YELLOW}🔧 Creating Lambda function...${NC}"
# Create or update Lambda function
aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --runtime nodejs18.x \
    --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/$ROLE_NAME \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --environment Variables="{EMAIL_TOPIC_ARN=$EMAIL_TOPIC_ARN,SMS_TOPIC_ARN=$SMS_TOPIC_ARN}" \
    --timeout 30 \
    --memory-size 256 2>/dev/null || \
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip

echo -e "${YELLOW}🌐 Creating API Gateway...${NC}"
# Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
    --name "contact-form-sns-api" \
    --protocol-type HTTP \
    --query 'ApiId' --output text 2>/dev/null || \
    aws apigatewayv2 get-apis --query "Items[?Name=='contact-form-sns-api'].ApiId" --output text)

echo -e "${GREEN}✅ API ID: $API_ID${NC}"

# Get Lambda function ARN
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)

echo -e "${YELLOW}🔗 Creating API integration...${NC}"
# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id $API_ID \
    --integration-type AWS_PROXY \
    --integration-uri $FUNCTION_ARN \
    --payload-format-version "2.0" \
    --query 'IntegrationId' --output text 2>/dev/null || \
    aws apigatewayv2 get-integrations --api-id $API_ID --query "Items[0].IntegrationId" --output text)

echo -e "${YELLOW}🛣️ Creating routes...${NC}"
# Create route
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "POST /contact" \
    --target "integrations/$INTEGRATION_ID" 2>/dev/null || echo "Route already exists"

# Create default route
aws apigatewayv2 create-route \
    --api-id $API_ID \
    --route-key "\$default" \
    --target "integrations/$INTEGRATION_ID" 2>/dev/null || echo "Default route already exists"

echo -e "${YELLOW}🚀 Creating stage...${NC}"
# Create stage
aws apigatewayv2 create-stage \
    --api-id $API_ID \
    --stage-name "\$default" \
    --auto-deploy 2>/dev/null || echo "Stage already exists"

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-apis --api-id $API_ID --query 'Items[0].ApiEndpoint' --output text)

echo -e "${YELLOW}🔐 Adding Lambda permission...${NC}"
# Add permission for API Gateway to invoke Lambda
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:us-east-1:$(aws sts get-caller-identity --query Account --output text):$API_ID/*" 2>/dev/null || echo "Permission already exists"

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${GREEN}📧 Email Topic ARN: $EMAIL_TOPIC_ARN${NC}"
echo -e "${GREEN}📱 SMS Topic ARN: $SMS_TOPIC_ARN${NC}"
echo -e "${GREEN}🌐 API Endpoint: https://$API_ID.execute-api.us-east-1.amazonaws.com/contact${NC}"

echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Subscribe to the email topic: aws sns subscribe --topic-arn $EMAIL_TOPIC_ARN --protocol email --notification-endpoint your-email@example.com"
echo "2. Subscribe to SMS topic (optional): aws sns subscribe --topic-arn $SMS_TOPIC_ARN --protocol sms --notification-endpoint +1234567890"
echo "3. Update your Angular environment with the new API endpoint"

# Cleanup
rm -f function.zip

echo -e "${GREEN}✅ SNS Contact Form Lambda deployed successfully!${NC}"
