# AWS SNS Implementation Guide for Portfolio Site

## 📧 Overview

This guide shows how to implement AWS SNS (Simple Notification Service) with your portfolio site to send notifications when users interact with your site.

## 🚀 Implementation Options

### 1. Contact Form Notifications (Primary Use Case)
- **Email notifications** when someone submits your contact form
- **SMS notifications** for urgent messages (optional)
- **Slack/Discord notifications** for team collaboration

### 2. Analytics Notifications
- **Daily/weekly reports** of portfolio visitors
- **Alerts** when high-profile visitors access your site
- **Login tracking summaries**

### 3. Chatbot Notifications
- **New conversation alerts** when someone uses your AI chatbot
- **Error notifications** if the chatbot fails

## 🛠️ Setup Instructions

### Step 1: Deploy the SNS Lambda Function

```bash
cd contact-form-sns-lambda
chmod +x deploy-sns-contact-form.sh
./deploy-sns-contact-form.sh
```

### Step 2: Subscribe to Notifications

#### Email Subscription
```bash
# Replace with your email and the actual topic ARN from deployment
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT:contact-form-notifications \
    --protocol email \
    --notification-endpoint your-email@example.com
```

#### SMS Subscription (Optional)
```bash
aws sns subscribe \
    --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT:contact-form-sms-notifications \
    --protocol sms \
    --notification-endpoint +1234567890
```

### Step 3: Update Angular Environment

Update `portfolio-site/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  contactApiUrl: 'https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/contact',
  // ... other config
};
```

## 📋 SNS Use Cases for Your Portfolio

### 1. Contact Form Notifications
```javascript
// When someone submits your contact form
{
  "name": "John Doe",
  "email": "john@company.com", 
  "subject": "Job Opportunity",
  "message": "Hi Michael, I saw your portfolio and..."
}
```

**Notification received:**
```
New Contact Form Submission

Name: John Doe
Email: john@company.com
Subject: Job Opportunity

Message:
Hi Michael, I saw your portfolio and would like to discuss...

---
Sent from michaelcopeland.com
Timestamp: 2025-08-16T17:30:00.000Z
IP Address: 192.168.1.100
```

### 2. Analytics Alerts
```javascript
// When a high-profile visitor accesses your site
{
  "visitor": "recruiter@google.com",
  "company": "Google",
  "page": "/projects",
  "timeSpent": "5 minutes"
}
```

### 3. Chatbot Usage Notifications
```javascript
// When someone uses your AI chatbot
{
  "user": "anonymous",
  "question": "What's your experience with React?",
  "response": "I have 3+ years of experience..."
}
```

## 🔧 Advanced SNS Features

### 1. Message Filtering
```javascript
// Only send SMS for urgent messages
const messageAttributes = {
  'urgency': {
    DataType: 'String',
    StringValue: 'high'
  }
};
```

### 2. Multiple Subscribers
- **Primary email**: Your main email
- **Backup email**: Secondary email for redundancy
- **SMS**: For urgent notifications
- **Slack webhook**: For team notifications

### 3. Message Templates
```javascript
const emailTemplate = `
🎯 New Portfolio Contact

👤 From: ${name}
📧 Email: ${email}
📝 Subject: ${subject}

💬 Message:
${message}

🌐 Source: michaelcopeland.com
⏰ Time: ${new Date().toLocaleString()}
📍 IP: ${ipAddress}
`;
```

## 📊 Monitoring and Analytics

### CloudWatch Metrics
- **Message delivery success rate**
- **Notification latency**
- **Failed deliveries**

### SNS Console
- **Message delivery status**
- **Subscription management**
- **Topic configuration**

## 🔒 Security Best Practices

### 1. IAM Permissions
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sns:Publish"
      ],
      "Resource": [
        "arn:aws:sns:us-east-1:YOUR_ACCOUNT:contact-form-notifications"
      ]
    }
  ]
}
```

### 2. Input Validation
```javascript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}
```

### 3. Rate Limiting
```javascript
// Implement rate limiting to prevent spam
const rateLimit = {
  maxRequests: 10,
  windowMs: 15 * 60 * 1000 // 15 minutes
};
```

## 🧪 Testing

### Test the SNS Integration
```bash
cd contact-form-sns-lambda
node test-sns-contact-form.js
```

### Manual Testing
1. Submit a contact form on your website
2. Check your email for the notification
3. Verify SMS notification (if configured)
4. Check CloudWatch logs for any errors

## 📈 Cost Optimization

### SNS Pricing (US East)
- **Email**: $0.50 per 1,000,000 requests
- **SMS**: $0.00645 per message (US)
- **HTTP/HTTPS**: $0.50 per 1,000,000 requests

### Cost-Saving Tips
1. **Use email for most notifications** (cheaper than SMS)
2. **Implement message filtering** to reduce unnecessary notifications
3. **Monitor usage** in CloudWatch
4. **Set up billing alerts** to avoid surprises

## 🚀 Next Steps

1. **Deploy the SNS Lambda function**
2. **Subscribe to email notifications**
3. **Test with your contact form**
4. **Add SMS notifications** (optional)
5. **Implement analytics alerts** (future enhancement)
6. **Add Slack/Discord integration** (optional)

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs for Lambda errors
2. Verify SNS topic subscriptions
3. Test API Gateway endpoints
4. Review IAM permissions

---

**Happy notifying! 🎉**
