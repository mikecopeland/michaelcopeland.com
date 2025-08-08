# HTTPS and Custom Domain Setup Guide

## 🎉 Current Status

✅ **Completed:**
- S3 bucket created and configured
- Portfolio deployed to S3
- CloudFront distribution created
- SSL certificate requested
- Initial setup complete

## 📋 Next Steps

### 1. SSL Certificate Validation (Required)

**Current Certificate ARN:** `arn:aws:acm:us-east-1:493811370553:certificate/c3bbfc7e-aa37-44dd-a465-d5c89e6d5387`

**To validate the certificate:**

1. **Go to AWS Certificate Manager:** https://console.aws.amazon.com/acm/
2. **Find your certificate** (should show "Pending validation")
3. **Click on the certificate** to view details
4. **Click "Create records in Route 53"** (if you have Route 53)
5. **Or manually add DNS records** to your domain

**Manual DNS Validation:**
- Add CNAME records to your domain as specified in the certificate details
- Wait 5-30 minutes for validation

### 2. Add Custom Domains (After Certificate Validation)

Once your certificate is validated, run:
```bash
./add-custom-domains.sh
```

This will add `michaelcopeland.com` and `www.michaelcopeland.com` to your CloudFront distribution.

### 3. Configure DNS Records

**In Route 53 (Recommended):**

1. **Go to Route 53 Console:** https://console.aws.amazon.com/route53/
2. **Create hosted zone** for `michaelcopeland.com` (if not exists)
3. **Add A records:**
   - **Name:** `michaelcopeland.com` → **Value:** `E8ZRHCLSWNNCV.cloudfront.net`
   - **Name:** `www.michaelcopeland.com` → **Value:** `E8ZRHCLSWNNCV.cloudfront.net`

**In GoDaddy (Temporary):**

1. **Go to GoDaddy DNS management**
2. **Add A records:**
   - **Host:** `@` → **Points to:** `E8ZRHCLSWNNCV.cloudfront.net`
   - **Host:** `www` → **Points to:** `E8ZRHCLSWNNCV.cloudfront.net`

### 4. Test Your Setup

**Current URLs:**
- **S3 Website:** http://michaelcopeland-portfolio.s3-website-us-east-1.amazonaws.com
- **CloudFront:** https://d32an32wlweszb.cloudfront.net
- **Custom Domain:** https://michaelcopeland.com (after DNS setup)

## 🔗 Useful Links

- **AWS Certificate Manager:** https://console.aws.amazon.com/acm/
- **CloudFront Console:** https://console.aws.amazon.com/cloudfront/
- **Route 53 Console:** https://console.aws.amazon.com/route53/
- **S3 Console:** https://console.aws.amazon.com/s3/buckets/michaelcopeland-portfolio

## 📊 Deployment Scripts

- **`./deploy.sh`** - Deploy to S3
- **`./setup-ssl-and-cloudfront.sh`** - Initial SSL/CloudFront setup
- **`./add-custom-domains.sh`** - Add custom domains (after certificate validation)

## 🚀 Final Result

Once complete, your portfolio will be available at:
- **https://michaelcopeland.com**
- **https://www.michaelcopeland.com**

With:
- ✅ HTTPS encryption
- ✅ Global CDN (CloudFront)
- ✅ Custom domain
- ✅ Professional setup

## ⚠️ Important Notes

1. **Certificate validation** must be completed before adding custom domains
2. **DNS propagation** can take up to 48 hours
3. **CloudFront deployment** takes 5-10 minutes
4. **Route 53 transfer** from GoDaddy should be completed before final DNS setup

## 🆘 Troubleshooting

**If certificate validation fails:**
- Check DNS records are correct
- Wait 30 minutes and try again
- Contact AWS support if needed

**If custom domains don't work:**
- Ensure certificate is validated
- Check DNS records point to CloudFront
- Wait for DNS propagation

