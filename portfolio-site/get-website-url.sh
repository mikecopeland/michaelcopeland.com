#!/bin/bash

BUCKET_NAME="michaelcopeland-portfolio"
REGION="us-east-1"
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "🎉 Your portfolio is now live!"
echo "🌐 Website URL: $WEBSITE_URL"
echo ""
echo "📋 Deployment Summary:"
echo "✅ S3 Bucket created: $BUCKET_NAME"
echo "✅ Static website hosting configured"
echo "✅ Public access enabled"
echo "✅ Files uploaded successfully"
echo ""
echo "🔗 Quick Links:"
echo "• Website: $WEBSITE_URL"
echo "• S3 Console: https://console.aws.amazon.com/s3/buckets/$BUCKET_NAME"
echo "• CloudFront (optional): https://console.aws.amazon.com/cloudfront/"
echo ""
echo "🚀 Next Steps:"
echo "1. Test your website at the URL above"
echo "2. Consider setting up CloudFront for HTTPS and better performance"
echo "3. Configure a custom domain if desired"
echo "4. Set up CI/CD for automatic deployments"
echo ""
echo "💡 To update your site in the future, run:"
echo "   ng build --configuration production && aws s3 sync dist/portfolio-site s3://$BUCKET_NAME --delete"



