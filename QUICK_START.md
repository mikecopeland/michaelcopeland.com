# Quick Start Guide

## Getting Started

This guide will help you set up and start building your portfolio site with Angular, Auth0, and AWS.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] Angular CLI installed (`npm install -g @angular/cli`)
- [ ] AWS CLI configured with appropriate permissions
- [ ] Auth0 account created
- [ ] GitHub account for CI/CD
- [ ] OpenAI API key (for chatbot)

## Step 1: Create Angular Project

```bash
# Create new Angular project
ng new portfolio-site --routing --style=css --skip-git
cd portfolio-site

# Install core dependencies
npm install @auth0/auth0-angular
npm install @angular/material @angular/cdk
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install socket.io-client
npm install -D @types/node
```

## Step 2: Configure Tailwind CSS

```bash
# Initialize Tailwind
npx tailwindcss init
```

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

Update `src/styles.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Step 3: Set Up Auth0

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new application
3. Choose "Single Page Application"
4. Configure settings:
   - Allowed Callback URLs: `http://localhost:4200`
   - Allowed Logout URLs: `http://localhost:4200`
   - Allowed Web Origins: `http://localhost:4200`

## Step 4: Create Environment Files

Create `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  auth0: {
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    audience: 'your-api-identifier'
  },
  apiUrl: 'http://localhost:3000'
};
```

Create `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  auth0: {
    domain: 'your-domain.auth0.com',
    clientId: 'your-client-id',
    audience: 'your-api-identifier'
  },
  apiUrl: 'https://api.yourdomain.com'
};
```

## Step 5: Set Up Basic Routing

Create `src/app/app-routing.module.ts`:
```typescript
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'projects', component: ProjectsComponent },
  { path: 'contact', component: ContactComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'chatbot', 
    component: ChatbotComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## Step 6: Create Basic Components

Generate components:
```bash
ng generate component components/public/home
ng generate component components/public/about
ng generate component components/public/projects
ng generate component components/public/contact
ng generate component components/private/dashboard
ng generate component components/private/chatbot
ng generate component components/shared/header
ng generate component components/shared/footer
```

## Step 7: Set Up AWS Infrastructure

1. **Create S3 Bucket**:
```bash
aws s3 mb s3://your-portfolio-bucket
aws s3 website s3://your-portfolio-bucket --index-document index.html --error-document index.html
```

2. **Create DynamoDB Table**:
```bash
aws dynamodb create-table \
  --table-name portfolio-chat-history \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=messageId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH AttributeName=messageId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

3. **Deploy Lambda Function**:
```bash
# Create lambda directory
mkdir -p lambda/chatbot
cd lambda/chatbot

# Create package.json
npm init -y
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb openai

# Create index.js (use the code from TECHNICAL_IMPLEMENTATION.md)
# Zip and deploy
zip -r function.zip .
aws lambda create-function \
  --function-name portfolio-chatbot \
  --runtime nodejs18.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role
```

## Step 8: Test Local Development

```bash
# Start development server
ng serve

# Open browser to http://localhost:4200
```

## Step 9: Deploy to Production

1. **Build for production**:
```bash
ng build --configuration production
```

2. **Deploy to S3**:
```bash
aws s3 sync dist/portfolio-site s3://your-portfolio-bucket --delete
```

3. **Set up CloudFront** (optional for better performance):
```bash
# Create CloudFront distribution pointing to your S3 bucket
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

## Step 10: Set Up CI/CD

1. **Create GitHub repository**
2. **Add secrets to GitHub**:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `LAMBDA_FUNCTION_NAME`

3. **Create `.github/workflows/deploy.yml`** (use the code from TECHNICAL_IMPLEMENTATION.md)

## Next Steps

1. **Customize Content**: Update the components with your personal information
2. **Style Your Site**: Customize the design using Tailwind CSS
3. **Add Features**: Implement the chatbot functionality
4. **Optimize**: Add SEO, performance optimizations, and accessibility features
5. **Monitor**: Set up analytics and error tracking

## Common Issues & Solutions

### Issue: Auth0 not working
- Check domain and client ID in environment files
- Verify callback URLs in Auth0 dashboard
- Ensure HTTPS in production

### Issue: Lambda function errors
- Check IAM permissions
- Verify environment variables
- Check CloudWatch logs

### Issue: CORS errors
- Configure API Gateway CORS settings
- Add proper headers in Lambda response

### Issue: Build errors
- Check Angular version compatibility
- Verify all dependencies are installed
- Clear node_modules and reinstall

## Development Tips

1. **Use Angular DevTools**: Install browser extension for debugging
2. **Use NgRx DevTools**: Monitor state changes
3. **Use AWS CLI**: For quick infrastructure management
4. **Use Postman**: Test API endpoints
5. **Use Lighthouse**: Check performance and accessibility

## Security Checklist

- [ ] HTTPS everywhere
- [ ] Environment variables for secrets
- [ ] Input validation
- [ ] Rate limiting
- [ ] CORS properly configured
- [ ] Auth0 scopes configured
- [ ] AWS IAM least privilege

## Performance Checklist

- [ ] Lazy loading implemented
- [ ] Images optimized
- [ ] Code splitting
- [ ] CDN configured
- [ ] Service worker (optional)
- [ ] Compression enabled

This quick start guide should get you up and running with the basic structure. Refer to the main plan and technical implementation guide for detailed code examples and advanced features.
