#!/bin/bash

# Configuration
BUCKET_NAME="michaelcopeland-portfolio"
DOMAIN_NAME="michaelcopeland.com"
WWW_DOMAIN="www.michaelcopeland.com"
REGION="us-east-1"
S3_WEBSITE_URL="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "🔒 Setting up SSL certificate and CloudFront for HTTPS..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Step 1: Request SSL Certificate
echo "📜 Step 1: Requesting SSL certificate..."
aws acm request-certificate \
    --domain-name $DOMAIN_NAME \
    --subject-alternative-names $WWW_DOMAIN \
    --validation-method DNS \
    --region $REGION > certificate-request.json

if [ $? -eq 0 ]; then
    CERTIFICATE_ARN=$(cat certificate-request.json | jq -r '.CertificateArn')
    echo "✅ SSL certificate requested: $CERTIFICATE_ARN"
    echo "$CERTIFICATE_ARN" > .certificate-arn
    
    echo ""
    echo "📋 Certificate Details:"
    echo "• Certificate ARN: $CERTIFICATE_ARN"
    echo "• Domains: $DOMAIN_NAME, $WWW_DOMAIN"
    echo "• Validation Method: DNS"
    echo ""
    echo "⚠️  IMPORTANT: You need to validate the certificate before proceeding."
    echo "1. Go to AWS Certificate Manager: https://console.aws.amazon.com/acm/"
    echo "2. Find your certificate and click 'Create records in Route 53'"
    echo "3. Or manually add the DNS validation records to your domain"
    echo ""
    echo "⏳ Waiting for certificate validation..."
    echo "   (This may take 5-30 minutes)"
    
else
    echo "❌ Failed to request SSL certificate"
    exit 1
fi

# Step 2: Create CloudFront distribution (without custom domains first)
echo ""
echo "📦 Step 2: Creating CloudFront distribution (without custom domains)..."
aws cloudfront create-distribution \
    --distribution-config '{
        "CallerReference": "'$(date +%s)'",
        "Comment": "Portfolio website distribution",
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-'$BUCKET_NAME'",
            "ViewerProtocolPolicy": "redirect-to-https",
            "AllowedMethods": {
                "Quantity": 2,
                "Items": ["GET", "HEAD"],
                "CachedMethods": {
                    "Quantity": 2,
                    "Items": ["GET", "HEAD"]
                }
            },
            "TrustedSigners": {
                "Enabled": false,
                "Quantity": 0
            },
            "ForwardedValues": {
                "QueryString": false,
                "Cookies": {
                    "Forward": "none"
                }
            },
            "MinTTL": 0,
            "DefaultTTL": 86400,
            "MaxTTL": 31536000,
            "Compress": true
        },
        "Enabled": true,
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-'$BUCKET_NAME'",
                    "DomainName": "'$S3_WEBSITE_URL'",
                    "CustomOriginConfig": {
                        "HTTPPort": 80,
                        "HTTPSPort": 443,
                        "OriginProtocolPolicy": "http-only"
                    }
                }
            ]
        },
        "PriceClass": "PriceClass_100",
        "DefaultRootObject": "index.html",
        "CustomErrorResponses": {
            "Quantity": 1,
            "Items": [
                {
                    "ErrorCode": 404,
                    "ResponsePagePath": "/index.html",
                    "ResponseCode": "200",
                    "ErrorCachingMinTTL": 300
                }
            ]
        }
    }' > cloudfront-distribution.json

if [ $? -eq 0 ]; then
    DISTRIBUTION_ID=$(cat cloudfront-distribution.json | jq -r '.Distribution.Id')
    CLOUDFRONT_DOMAIN=$(cat cloudfront-distribution.json | jq -r '.Distribution.DomainName')
    
    echo "✅ CloudFront distribution created successfully"
    echo "📋 Distribution Details:"
    echo "• Distribution ID: $DISTRIBUTION_ID"
    echo "• CloudFront Domain: $CLOUDFRONT_DOMAIN"
    
    # Save the distribution ID for future use
    echo "$DISTRIBUTION_ID" > .cloudfront-distribution-id
    echo "$CLOUDFRONT_DOMAIN" > .cloudfront-domain
    
    echo ""
    echo "🎉 Initial setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Wait for SSL certificate validation (5-30 minutes)"
    echo "2. Once validated, run: ./add-custom-domains.sh"
    echo "3. Configure DNS records in Route 53"
    echo ""
    echo "🔗 Useful Links:"
    echo "• Certificate Manager: https://console.aws.amazon.com/acm/"
    echo "• CloudFront Console: https://console.aws.amazon.com/cloudfront/"
    echo "• Route 53 Console: https://console.aws.amazon.com/route53/"
    
else
    echo "❌ Failed to create CloudFront distribution"
    exit 1
fi





