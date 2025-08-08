#!/bin/bash

# Configuration
BUCKET_NAME="michaelcopeland-portfolio"
DOMAIN_NAME="michaelcopeland.com"
WWW_DOMAIN="www.michaelcopeland.com"
REGION="us-east-1"
S3_WEBSITE_URL="$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "🌐 Setting up CloudFront for HTTPS and custom domain..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Create CloudFront distribution
echo "📦 Creating CloudFront distribution..."

# Create the CloudFront distribution configuration
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
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    },
                    "CustomOriginConfig": {
                        "HTTPPort": 80,
                        "HTTPSPort": 443,
                        "OriginProtocolPolicy": "http-only"
                    }
                }
            ]
        },
        "Aliases": {
            "Quantity": 2,
            "Items": ["'$DOMAIN_NAME'", "'$WWW_DOMAIN'"]
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
    echo "✅ CloudFront distribution created successfully"
    
    # Extract the distribution ID and domain name
    DISTRIBUTION_ID=$(cat cloudfront-distribution.json | jq -r '.Distribution.Id')
    CLOUDFRONT_DOMAIN=$(cat cloudfront-distribution.json | jq -r '.Distribution.DomainName')
    
    echo "📋 Distribution Details:"
    echo "• Distribution ID: $DISTRIBUTION_ID"
    echo "• CloudFront Domain: $CLOUDFRONT_DOMAIN"
    echo "• Custom Domains: $DOMAIN_NAME, $WWW_DOMAIN"
    
    # Save the distribution ID for future use
    echo "$DISTRIBUTION_ID" > .cloudfront-distribution-id
    echo "$CLOUDFRONT_DOMAIN" > .cloudfront-domain
    
    echo ""
    echo "🎉 CloudFront setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Wait for CloudFront to deploy (5-10 minutes)"
    echo "2. Configure DNS records in Route 53:"
    echo "   - Create A record for $DOMAIN_NAME pointing to $CLOUDFRONT_DOMAIN"
    echo "   - Create A record for $WWW_DOMAIN pointing to $CLOUDFRONT_DOMAIN"
    echo "3. Request SSL certificate in AWS Certificate Manager"
    echo ""
    echo "🔗 Useful Links:"
    echo "• CloudFront Console: https://console.aws.amazon.com/cloudfront/"
    echo "• Route 53 Console: https://console.aws.amazon.com/route53/"
    echo "• Certificate Manager: https://console.aws.amazon.com/acm/"
    
else
    echo "❌ Failed to create CloudFront distribution"
    exit 1
fi

