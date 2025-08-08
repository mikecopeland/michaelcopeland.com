#!/bin/bash

# Configuration
DOMAIN_NAME="michaelcopeland.com"
WWW_DOMAIN="www.michaelcopeland.com"
REGION="us-east-1"

echo "🌐 Adding custom domains to CloudFront..."

# Check if distribution ID exists
if [ ! -f ".cloudfront-distribution-id" ]; then
    echo "❌ CloudFront distribution ID not found. Run setup-ssl-and-cloudfront.sh first."
    exit 1
fi

# Check if certificate ARN exists
if [ ! -f ".certificate-arn" ]; then
    echo "❌ Certificate ARN not found. Run setup-ssl-and-cloudfront.sh first."
    exit 1
fi

DISTRIBUTION_ID=$(cat .cloudfront-distribution-id)
CERTIFICATE_ARN=$(cat .certificate-arn)

echo "✅ Found distribution ID: $DISTRIBUTION_ID"
echo "✅ Found certificate ARN: $CERTIFICATE_ARN"

# Get current distribution configuration
echo "📋 Getting current distribution configuration..."
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID > current-distribution.json

if [ $? -ne 0 ]; then
    echo "❌ Failed to get distribution configuration"
    exit 1
fi

# Extract the ETag
ETAG=$(cat current-distribution.json | jq -r '.ETag')

# Update the distribution configuration with custom domains and certificate
echo "🔧 Updating distribution with custom domains and SSL certificate..."

# Create updated configuration
jq --arg cert "$CERTIFICATE_ARN" \
   --arg domain "$DOMAIN_NAME" \
   --arg www_domain "$WWW_DOMAIN" \
   '.DistributionConfig.Aliases = {
       "Quantity": 2,
       "Items": [$domain, $www_domain]
   } | .DistributionConfig.ViewerCertificate = {
       "ACMCertificateArn": $cert,
       "SSLSupportMethod": "sni-only",
       "MinimumProtocolVersion": "TLSv1.2_2021"
   }' current-distribution.json > updated-distribution.json

# Update the distribution
aws cloudfront update-distribution \
    --id $DISTRIBUTION_ID \
    --distribution-config file://updated-distribution.json \
    --if-match $ETAG > updated-distribution-result.json

if [ $? -eq 0 ]; then
    echo "✅ Custom domains added successfully!"
    echo ""
    echo "📋 Updated Distribution Details:"
    echo "• Distribution ID: $DISTRIBUTION_ID"
    echo "• Custom Domains: $DOMAIN_NAME, $WWW_DOMAIN"
    echo "• SSL Certificate: $CERTIFICATE_ARN"
    echo ""
    echo "🎉 Your portfolio will be available at:"
    echo "• https://$DOMAIN_NAME"
    echo "• https://$WWW_DOMAIN"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Wait for CloudFront to deploy (5-10 minutes)"
    echo "2. Configure DNS records in Route 53:"
    echo "   - Create A record for $DOMAIN_NAME pointing to $DISTRIBUTION_ID.cloudfront.net"
    echo "   - Create A record for $WWW_DOMAIN pointing to $DISTRIBUTION_ID.cloudfront.net"
    echo ""
    echo "🔗 Useful Links:"
    echo "• CloudFront Console: https://console.aws.amazon.com/cloudfront/"
    echo "• Route 53 Console: https://console.aws.amazon.com/route53/"
    
else
    echo "❌ Failed to update distribution"
    exit 1
fi

