# Technical Implementation Guide

## 1. Project Setup

### Prerequisites
- Node.js 18+ 
- Angular CLI 17+
- AWS CLI configured
- Auth0 account
- GitHub account

### Initial Setup
```bash
# Create new Angular project
ng new portfolio-site --routing --style=css --skip-git
cd portfolio-site

# Install dependencies
npm install @auth0/auth0-angular
npm install @angular/material @angular/cdk
npm install @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
npm install socket.io-client
npm install -D @types/node
```

## 2. Angular Configuration

### Tailwind CSS Setup
```bash
npx tailwindcss init
```

```javascript
// tailwind.config.js
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

### Angular Material Setup
```typescript
// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from '@auth0/auth0-angular';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AuthModule.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: environment.auth0.audience,
      },
    }),
    StoreModule.forRoot({}),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
```

## 3. Authentication Service

```typescript
// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface User {
  sub: string;
  name: string;
  email: string;
  picture?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private auth0: Auth0Service) {
    this.auth0.user$.subscribe(user => {
      this.userSubject.next(user);
    });
  }

  login(): void {
    this.auth0.loginWithRedirect();
  }

  logout(): void {
    this.auth0.logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }

  isAuthenticated$(): Observable<boolean> {
    return this.auth0.isAuthenticated$;
  }

  getUser$(): Observable<User | null> {
    return this.auth0.user$;
  }

  getAccessToken$(): Observable<string | undefined> {
    return this.auth0.getAccessTokenSilently();
  }
}
```

## 4. Auth Guard

```typescript
// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.auth.isAuthenticated$.pipe(
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}
```

## 5. Chatbot Service

```typescript
// src/app/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

export interface ChatResponse {
  message: ChatMessage;
  conversationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private conversationId: string | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  sendMessage(content: string): Observable<ChatResponse> {
    const message: ChatMessage = {
      id: this.generateId(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    this.addMessage(message);

    return this.authService.getAccessToken$().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        return this.http.post<ChatResponse>(
          `${environment.apiUrl}/chat`,
          {
            message: content,
            conversationId: this.conversationId
          },
          { headers }
        ).pipe(
          tap(response => {
            this.conversationId = response.conversationId;
            this.addMessage(response.message);
          })
        );
      })
    );
  }

  getChatHistory(): Observable<ChatMessage[]> {
    return this.authService.getAccessToken$().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.get<ChatMessage[]>(
          `${environment.apiUrl}/chat/history`,
          { headers }
        );
      }),
      tap(messages => {
        this.messagesSubject.next(messages);
      })
    );
  }

  clearHistory(): Observable<void> {
    return this.authService.getAccessToken$().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.delete<void>(
          `${environment.apiUrl}/chat/history`,
          { headers }
        );
      }),
      tap(() => {
        this.messagesSubject.next([]);
        this.conversationId = null;
      })
    );
  }

  private addMessage(message: ChatMessage): void {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
```

## 6. Chatbot Component

```typescript
// src/app/components/private/chatbot/chatbot.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../services/chatbot.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  messages$: Observable<ChatMessage[]>;
  messageForm: FormGroup;
  isLoading = false;

  constructor(
    private chatbotService: ChatbotService,
    private fb: FormBuilder
  ) {
    this.messages$ = this.chatbotService.messages$;
    this.messageForm = this.fb.group({
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadChatHistory();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.messageForm.valid && !this.isLoading) {
      const message = this.messageForm.get('message')?.value;
      this.isLoading = true;

      this.chatbotService.sendMessage(message).subscribe({
        next: () => {
          this.messageForm.reset();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.isLoading = false;
        }
      });
    }
  }

  clearHistory(): void {
    this.chatbotService.clearHistory().subscribe();
  }

  private loadChatHistory(): void {
    this.chatbotService.getChatHistory().subscribe();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }
}
```

```html
<!-- src/app/components/private/chatbot/chatbot.component.html -->
<div class="flex flex-col h-full max-w-4xl mx-auto">
  <!-- Header -->
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">AI Assistant</h1>
      <button
        (click)="clearHistory()"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
      >
        Clear History
      </button>
    </div>
  </div>

  <!-- Messages -->
  <div 
    #messagesContainer
    class="flex-1 overflow-y-auto px-6 py-4 space-y-4"
  >
    <div 
      *ngFor="let message of messages$ | async"
      class="flex"
      [ngClass]="message.sender === 'user' ? 'justify-end' : 'justify-start'"
    >
      <div 
        class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg"
        [ngClass]="message.sender === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-900'"
      >
        <p class="text-sm">{{ message.content }}</p>
        <p class="text-xs opacity-75 mt-1">
          {{ message.timestamp | date:'shortTime' }}
        </p>
      </div>
    </div>

    <!-- Loading indicator -->
    <div *ngIf="isLoading" class="flex justify-start">
      <div class="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <span class="text-sm">Assistant is typing...</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Input Form -->
  <div class="bg-white border-t border-gray-200 px-6 py-4">
    <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="flex space-x-4">
      <input
        type="text"
        formControlName="message"
        placeholder="Ask me about my experience, skills, or projects..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        [disabled]="isLoading"
      />
      <button
        type="submit"
        [disabled]="messageForm.invalid || isLoading"
        class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  </div>
</div>
```

## 7. AWS Lambda Function

```javascript
// lambda/chatbot/index.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { OpenAI } = require('openai');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Resume data structure
const RESUME_DATA = {
  name: "Michael Copeland",
  title: "Senior Software Engineer",
  experience: [
    {
      company: "Tech Company",
      role: "Senior Software Engineer",
      duration: "2020-2023",
      skills: ["Angular", "TypeScript", "AWS", "Node.js"],
      achievements: ["Led team of 5 developers", "Improved performance by 40%"]
    }
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "Java"],
    frameworks: ["Angular", "React", "Node.js", "Express"],
    cloud: ["AWS", "Docker", "Kubernetes"],
    databases: ["PostgreSQL", "MongoDB", "Redis"]
  },
  education: {
    degree: "Bachelor of Science in Computer Science",
    university: "University Name",
    year: "2018"
  }
};

exports.handler = async (event) => {
  try {
    const { message, conversationId, userId } = JSON.parse(event.body);
    
    // Get conversation history
    const history = await getConversationHistory(userId, conversationId);
    
    // Prepare context for AI
    const context = prepareContext(RESUME_DATA, history);
    
    // Generate response using OpenAI
    const response = await generateResponse(message, context);
    
    // Save message to DynamoDB
    const messageId = await saveMessage(userId, conversationId, message, response);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: {
          id: messageId,
          content: response,
          sender: 'assistant',
          timestamp: new Date().toISOString()
        },
        conversationId: conversationId || messageId
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function getConversationHistory(userId, conversationId) {
  if (!conversationId) return [];
  
  const params = {
    TableName: process.env.CHAT_TABLE_NAME,
    KeyConditionExpression: 'userId = :userId AND conversationId = :conversationId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':conversationId': conversationId
    },
    ScanIndexForward: false,
    Limit: 10
  };
  
  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

function prepareContext(resumeData, history) {
  const context = `You are an AI assistant for ${resumeData.name}, a ${resumeData.title}. 
  
  Resume Information:
  - Name: ${resumeData.name}
  - Title: ${resumeData.title}
  - Experience: ${JSON.stringify(resumeData.experience)}
  - Skills: ${JSON.stringify(resumeData.skills)}
  - Education: ${resumeData.education.degree} from ${resumeData.education.university} (${resumeData.education.year})
  
  Previous conversation context:
  ${history.map(msg => `${msg.sender}: ${msg.content}`).join('\n')}
  
  Instructions: Answer questions about ${resumeData.name}'s experience, skills, projects, and background based on the resume information provided. Be helpful, professional, and accurate. If asked about something not in the resume, politely say you don't have that information.`;
  
  return context;
}

async function generateResponse(message, context) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: context },
      { role: "user", content: message }
    ],
    max_tokens: 500,
    temperature: 0.7
  });
  
  return completion.choices[0].message.content;
}

async function saveMessage(userId, conversationId, userMessage, assistantResponse) {
  const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();
  
  // Save user message
  await docClient.send(new PutCommand({
    TableName: process.env.CHAT_TABLE_NAME,
    Item: {
      userId,
      conversationId: conversationId || messageId,
      messageId: `${messageId}-user`,
      content: userMessage,
      sender: 'user',
      timestamp
    }
  }));
  
  // Save assistant response
  await docClient.send(new PutCommand({
    TableName: process.env.CHAT_TABLE_NAME,
    Item: {
      userId,
      conversationId: conversationId || messageId,
      messageId: `${messageId}-assistant`,
      content: assistantResponse,
      sender: 'assistant',
      timestamp
    }
  }));
  
  return messageId;
}
```

## 8. Infrastructure as Code

```yaml
# infrastructure/cloudformation/template.yml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Portfolio Site Infrastructure'

Parameters:
  DomainName:
    Type: String
    Description: Domain name for the portfolio site
  
Resources:
  # S3 Bucket for static website hosting
  PortfolioBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${DomainName}-portfolio'
      WebsiteConfiguration:
        IndexDocument: index.html
        ErrorDocument: index.html
      PublicAccessBlockConfiguration:
        BlockPublicAcls: false
        BlockPublicPolicy: false
        IgnorePublicAcls: false
        RestrictPublicBuckets: false

  # S3 Bucket Policy
  PortfolioBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref PortfolioBucket
      PolicyDocument:
        Statement:
          - Sid: PublicReadGetObject
            Effect: Allow
            Principal: '*'
            Action: 's3:GetObject'
            Resource: !Sub '${PortfolioBucket}/*'

  # CloudFront Distribution
  PortfolioDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt PortfolioBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${CloudFrontOAI}'
        Enabled: true
        DefaultRootObject: index.html
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
          CachedMethods:
            - GET
            - HEAD
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none

  # DynamoDB Table for chat history
  ChatTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${DomainName}-chat-history'
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
        - AttributeName: conversationId
          AttributeType: S
        - AttributeName: messageId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
        - AttributeName: messageId
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: ConversationIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
            - AttributeName: conversationId
              KeyType: RANGE
          Projection:
            ProjectionType: ALL

  # Lambda Function
  ChatbotFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${DomainName}-chatbot'
      Runtime: nodejs18.x
      Handler: index.handler
      Code:
        ZipFile: |
          exports.handler = async (event) => {
            return { statusCode: 200, body: 'Hello from Lambda!' };
          };
      Environment:
        Variables:
          CHAT_TABLE_NAME: !Ref ChatTable
          OPENAI_API_KEY: '{{resolve:secretsmanager:openai-api-key:SecretString:api-key}}'
      Role: !GetAtt LambdaExecutionRole.Arn

  # Lambda Execution Role
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: DynamoDBAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - dynamodb:GetItem
                  - dynamodb:PutItem
                  - dynamodb:Query
                  - dynamodb:DeleteItem
                Resource: !GetAtt ChatTable.Arn

  # API Gateway
  ChatbotApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Sub '${DomainName}-chatbot-api'
      Description: API for portfolio chatbot

  ChatbotResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref ChatbotApi
      ParentId: !GetAtt ChatbotApi.RootResourceId
      PathPart: chat

  ChatbotMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ChatbotApi
      ResourceId: !Ref ChatbotResource
      HttpMethod: POST
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${ChatbotFunction.Arn}/invocations'

  ChatbotDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn: ChatbotMethod
    Properties:
      RestApiId: !Ref ChatbotApi
      StageName: prod

  # Lambda Permission
  LambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref ChatbotFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub 'arn:aws:execute-api:${AWS::Region}:${AWS::AccountId}:${ChatbotApi}/*'

Outputs:
  WebsiteURL:
    Description: URL of the portfolio website
    Value: !GetAtt PortfolioBucket.WebsiteURL
    Export:
      Name: !Sub '${DomainName}-website-url'

  CloudFrontURL:
    Description: CloudFront distribution URL
    Value: !GetAtt PortfolioDistribution.DomainName
    Export:
      Name: !Sub '${DomainName}-cloudfront-url'

  ApiURL:
    Description: API Gateway URL
    Value: !Sub 'https://${ChatbotApi}.execute-api.${AWS::Region}.amazonaws.com/prod'
    Export:
      Name: !Sub '${DomainName}-api-url'
```

## 9. CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Portfolio

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:prod
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/portfolio-site s3://${{ secrets.S3_BUCKET }} --delete
      
      - name: Invalidate CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"

  deploy-lambda:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd lambda/chatbot
          npm ci
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy Lambda function
        run: |
          cd lambda/chatbot
          zip -r function.zip .
          aws lambda update-function-code \
            --function-name ${{ secrets.LAMBDA_FUNCTION_NAME }} \
            --zip-file fileb://function.zip
```

## 10. Environment Configuration

```typescript
// src/environments/environment.ts
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

```typescript
// src/environments/environment.prod.ts
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

This technical implementation guide provides all the code and configuration needed to build your portfolio site with the chatbot feature. The next step would be to start implementing these components one by one, beginning with the Angular project setup and basic routing structure.
