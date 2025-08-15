#!/bin/bash

# Configuration
BUCKET_NAME="michaelcopeland-portfolio"
REGION="us-east-1"
DIST_FOLDER="dist/portfolio-site"

echo "🚀 Deploying portfolio to AWS S3..."

# Build the application
echo "📦 Building Angular application..."
ng build --configuration production

# Check if build was successful
if [ ! -d "$DIST_FOLDER" ]; then
    echo "❌ Build failed. Exiting."
    exit 1
fi

echo "✅ Build completed successfully"

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
    2>/dev/null || echo "Bucket already exists"

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

# Disable public access blocks
echo "🔓 Enabling public access"
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

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

# Upload files to S3 (copy from browser subdirectory to root)
echo "📤 Uploading files to S3..."
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME --delete

# Copy files from browser subdirectory to root
echo "📁 Moving files to root directory..."
aws s3 cp s3://$BUCKET_NAME/browser/ s3://$BUCKET_NAME/ --recursive

# Get the website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo ""
echo "🎉 Deployment complete!"
echo "🌐 Your portfolio is live at: $WEBSITE_URL"
echo ""
echo "📋 Deployment Summary:"
echo "✅ Angular app built successfully"
echo "✅ S3 Bucket configured: $BUCKET_NAME"
echo "✅ Static website hosting enabled"
echo "✅ Public access configured"
echo "✅ Files uploaded and organized"
echo ""
echo "🔗 Quick Links:"
echo "• Website: $WEBSITE_URL"
echo "• S3 Console: https://console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo ""
echo "🚀 Next Steps:"
echo "1. Test your website at the URL above"
echo "2. Consider setting up CloudFront for HTTPS and better performance"
echo "3. Configure a custom domain if desired"
echo "4. Set up CI/CD for automatic deployments"
echo ""
echo "💡 To update your site in the future, just run: ./deploy.sh"



