# Auth0 Setup Guide for Portfolio

## 🎯 Overview

This guide will help you set up Auth0 authentication for your portfolio website, including:
- User authentication
- Protected chatbot section
- User profile management

## 📋 Prerequisites

1. **Auth0 Account**: Sign up at https://auth0.com/
2. **Domain**: Your portfolio domain (michaelcopeland.com)
3. **Angular App**: Already configured with Auth0 SDK

## 🔧 Step 1: Create Auth0 Application

### 1.1 Create Application
1. **Go to Auth0 Dashboard**: https://manage.auth0.com/
2. **Navigate to**: Applications → Applications
3. **Click**: "Create Application"
4. **Name**: "Michael Copeland Portfolio"
5. **Type**: "Single Page Application"
6. **Click**: "Create"

### 1.2 Configure Application Settings

**Allowed Callback URLs:**
```
http://localhost:4200,
https://michaelcopeland.com,
https://www.michaelcopeland.com,
https://d32an32wlweszb.cloudfront.net
```

**Allowed Logout URLs:**
```
http://localhost:4200,
https://michaelcopeland.com,
https://www.michaelcopeland.com,
https://d32an32wlweszb.cloudfront.net
```

**Allowed Web Origins:**
```
http://localhost:4200,
https://michaelcopeland.com,
https://www.michaelcopeland.com,
https://d32an32wlweszb.cloudfront.net
```

### 1.3 Get Application Credentials
- **Domain**: Copy from your Auth0 application
- **Client ID**: Copy from your Auth0 application
- **Audience**: Create an API identifier (optional for now)

## 🔧 Step 2: Update Environment Configuration

### 2.1 Development Environment
Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  auth0: {
    domain: 'your-domain.auth0.com', // Replace with your Auth0 domain
    clientId: 'your-client-id',      // Replace with your client ID
    audience: 'https://api.michaelcopeland.com' // Optional API identifier
  },
  apiUrl: 'http://localhost:3000'
};
```

### 2.2 Production Environment
Update `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  auth0: {
    domain: 'your-domain.auth0.com', // Replace with your Auth0 domain
    clientId: 'your-client-id',      // Replace with your client ID
    audience: 'https://api.michaelcopeland.com' // Optional API identifier
  },
  apiUrl: 'https://api.michaelcopeland.com'
};
```

## 🔧 Step 3: Create Protected Components

### 3.1 Dashboard Component
```bash
ng generate component components/protected/dashboard --standalone
```

### 3.2 Chatbot Component
```bash
ng generate component components/protected/chatbot --standalone
```

### 3.3 Auth Guard
Already exists at `src/app/guards/auth.guard.ts`

## 🔧 Step 4: Update Routes

Add protected routes to `src/app/app.routes.ts`:

```typescript
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // ... existing routes ...
  {
    path: 'dashboard',
    loadComponent: () => import('./components/protected/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'chatbot',
    loadComponent: () => import('./components/protected/chatbot/chatbot.component').then(m => m.ChatbotComponent),
    canActivate: [authGuard]
  }
];
```

## 🔧 Step 5: Create Chatbot Service

Create `src/app/services/chatbot.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/chat`, { message });
  }

  getChatHistory(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/chat/history`);
  }
}
```

## 🔧 Step 6: Create Lambda Function (Optional)

For the chatbot backend, you can create an AWS Lambda function:

### 6.1 Lambda Function Structure
```javascript
// index.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.handler = async (event) => {
  try {
    const { message } = JSON.parse(event.body);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant for Michael Copeland, a software engineer. Answer questions about his experience, skills, and projects based on his resume."
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: JSON.stringify({
        response: completion.choices[0].message.content
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
```

## 🚀 Step 7: Test Authentication

### 7.1 Development Testing
```bash
ng serve
```
- Navigate to http://localhost:4200
- Click "Login" button
- Test authentication flow
- Test protected routes

### 7.2 Production Deployment
```bash
./deploy.sh
```

## 📋 Configuration Checklist

- [ ] Auth0 application created
- [ ] Environment variables configured
- [ ] Protected components created
- [ ] Routes updated
- [ ] Auth guard working
- [ ] Login/logout functionality working
- [ ] Protected routes accessible
- [ ] Chatbot service implemented
- [ ] Lambda function deployed (optional)

## 🔗 Useful Links

- **Auth0 Dashboard**: https://manage.auth0.com/
- **Auth0 Documentation**: https://auth0.com/docs/
- **Angular Auth0 SDK**: https://github.com/auth0/auth0-angular

## 🆘 Troubleshooting

**Common Issues:**
1. **CORS Errors**: Ensure allowed origins are configured correctly
2. **Callback Errors**: Check callback URLs in Auth0 settings
3. **Route Protection**: Verify auth guard is working
4. **Environment Variables**: Ensure all Auth0 credentials are correct

## 🎉 Next Steps

Once Auth0 is configured:
1. Test authentication flow
2. Create chatbot interface
3. Deploy Lambda function
4. Test end-to-end functionality

