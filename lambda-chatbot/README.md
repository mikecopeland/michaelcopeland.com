# Portfolio AI Chatbot Lambda Function

This Lambda function powers the AI chatbot for Michael Copeland's portfolio website. It uses OpenAI's GPT API to provide intelligent responses about Michael's background, skills, and experience.

## 🏗️ Architecture

```
Angular App → API Gateway → Lambda Function → OpenAI API
                ↓
            DynamoDB (chat history)
```

## 🚀 Quick Setup

### 1. Get OpenAI API Key
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-...`)

### 2. Deploy Lambda Function
```bash
cd lambda-chatbot
./deploy-lambda.sh
```

### 3. Set OpenAI API Key
```bash
aws lambda update-function-configuration \
  --function-name portfolio-chatbot \
  --environment Variables='{"OPENAI_API_KEY":"your-actual-api-key-here"}'
```

### 4. Update Angular Environment
After deployment, update `portfolio-site/src/environments/environment.prod.ts` with the actual API Gateway URL:

```typescript
chatbotApiUrl: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/chat'
```

## 🧪 Testing

### Test Lambda Function Directly
```bash
aws lambda invoke \
  --function-name portfolio-chatbot \
  --payload '{"httpMethod":"POST","body":"{\"message\":\"Hello!\"}"}' \
  response.json && cat response.json
```

### Test API Gateway Endpoint
```bash
curl -X POST https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about Michael'\''s experience"}'
```

## 📊 AWS Resources Created

- **Lambda Function**: `portfolio-chatbot`
- **IAM Role**: `portfolio-chatbot-role`
- **DynamoDB Table**: `ChatHistory`
- **API Gateway**: `portfolio-chatbot-api`

## 💰 Cost Estimation

### OpenAI API Costs
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical conversation**: ~500 tokens = $0.001
- **100 conversations/month**: ~$0.10

### AWS Costs (Free Tier)
- **Lambda**: First 1M requests free
- **DynamoDB**: 25GB free storage
- **API Gateway**: First 1M API calls free

**Total estimated cost**: <$1/month for personal portfolio

## 🔧 Configuration Options

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required)

### Customization
- Edit `RESUME_CONTEXT` in `index.js` to update Michael's information
- Adjust `max_tokens` and `temperature` for different response styles
- Modify DynamoDB schema for additional chat features

## 🛠️ Development

### Local Testing
```bash
# Install dependencies
npm install

# Test locally (requires AWS credentials)
node -e "
const handler = require('./index').handler;
handler({
  httpMethod: 'POST',
  body: JSON.stringify({message: 'Hello!'})
}).then(console.log);
"
```

### Updating the Function
```bash
# After making changes
npm run package
npm run deploy
```

## 🔒 Security Features

- **CORS**: Configured to allow requests from your portfolio domain
- **IAM**: Minimal permissions (Lambda execution + DynamoDB access)
- **API Gateway**: HTTP API with CORS protection
- **Environment Variables**: API keys stored securely in Lambda

## 📝 Next Steps

1. **Custom Domain**: Set up a custom domain for the API Gateway
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Authentication**: Integrate with Auth0 for user-specific chats
4. **Monitoring**: Set up CloudWatch alarms for errors
5. **Enhanced Context**: Add more detailed resume information



