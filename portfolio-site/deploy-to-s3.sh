#!/bin/bash

# Configuration
BUCKET_NAME="michaelcopeland-portfolio"
REGION="us-east-1"
DIST_FOLDER="dist/portfolio-site"

echo "🚀 Deploying portfolio to AWS S3..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Create S3 bucket (if it doesn't exist)
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws s3api create-bucket \
    --bucket $BUCKET_NAME \
    --region $REGION \
    --create-bucket-configuration LocationConstraint=$REGION \
    2>/dev/null || echo "Bucket already exists or error occurred"

# Configure bucket for static website hosting
echo "🌐 Configuring bucket for static website hosting"
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration '{
        "IndexDocument": {
            "Suffix": "index.html"
        },
        "ErrorDocument": {
            "Key": "index.html"
        }
    }'

# Set bucket policy for public read access
echo "🔓 Setting bucket policy for public access"
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
            }
        ]
    }'

# Upload files to S3
echo "📤 Uploading files to S3..."
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME --delete

# Get the website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your portfolio is live at: $WEBSITE_URL"
echo ""
echo "📋 Next steps:"
echo "1. Consider setting up CloudFront for HTTPS and better performance"
echo "2. Configure a custom domain if desired"
echo "3. Set up CI/CD for automatic deployments"
echo ""
echo "🔗 S3 Console: https://console.aws.amazon.com/s3/buckets/$BUCKET_NAME"

