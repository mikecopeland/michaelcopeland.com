# Personal Portfolio Site Plan

## Overview
A modern, responsive personal portfolio website built with Angular, featuring public sections and a private authenticated area with an AI chatbot assistant.

## Technology Stack

### Frontend
- **Framework**: Angular 17+ (latest LTS)
- **Styling**: Tailwind CSS + Angular Material
- **State Management**: NgRx (for complex state) / Angular Signals (for simpler state)
- **Authentication**: Auth0 Angular SDK
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with guards

### Backend & Infrastructure
- **Hosting**: AWS S3 + CloudFront
- **Authentication**: Auth0
- **Chatbot**: AWS Lambda + API Gateway
- **Database**: DynamoDB (for chat history)
- **CI/CD**: GitHub Actions

## Project Structure

```
portfolio-site/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── public/
│   │   │   │   ├── header/
│   │   │   │   ├── hero/
│   │   │   │   ├── about/
│   │   │   │   ├── projects/
│   │   │   │   ├── skills/
│   │   │   │   ├── contact/
│   │   │   │   └── footer/
│   │   │   ├── shared/
│   │   │   │   ├── loading/
│   │   │   │   ├── error/
│   │   │   │   └── navigation/
│   │   │   └── private/
│   │   │       ├── dashboard/
│   │   │       └── chatbot/
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── chatbot.service.ts
│   │   │   ├── resume.service.ts
│   │   │   └── api.service.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── chat.model.ts
│   │   │   └── project.model.ts
│   │   ├── store/
│   │   │   ├── actions/
│   │   │   ├── reducers/
│   │   │   └── effects/
│   │   └── app.component.ts
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   └── environments/
├── lambda/
│   └── chatbot/
├── infrastructure/
│   ├── terraform/
│   └── cloudformation/
└── docs/
```

## Features & Sections

### Public Sections (No Authentication Required)

#### 1. Landing Page
- Hero section with name, title, and call-to-action
- Smooth scroll navigation
- Responsive design for all devices

#### 2. About Me
- Professional summary
- Personal story and background
- Professional photo
- Downloadable resume (PDF)

#### 3. Skills & Technologies
- Technical skills with proficiency levels
- Programming languages, frameworks, tools
- Visual representation (charts/graphs)
- Certifications and achievements

#### 4. Projects Portfolio
- Featured projects with descriptions
- GitHub links and live demos
- Technology stack used
- Project screenshots/videos
- Filter by technology/category

#### 5. Experience
- Work history timeline
- Company logos and descriptions
- Key achievements and responsibilities
- Duration and roles

#### 6. Contact
- Contact form
- Social media links
- Email and phone (optional)
- Location and availability

### Private Section (Auth0 Protected)

#### 1. Dashboard
- Welcome message with user info
- Quick stats and analytics
- Recent activity
- Navigation to chatbot

#### 2. AI Chatbot Assistant
- Real-time chat interface
- Resume-based Q&A functionality
- Chat history persistence
- Export chat conversations
- Typing indicators and loading states

## Authentication Flow

### Auth0 Configuration
1. **Setup**: Auth0 application with Angular SPA configuration
2. **Scopes**: Custom scopes for chatbot access
3. **Rules**: Custom rules for user metadata
4. **API**: Auth0 API for additional user info

### Protected Routes
- `/dashboard` - Main authenticated area
- `/chatbot` - AI assistant interface
- Route guards prevent unauthorized access

## Chatbot Implementation

### Frontend (Angular)
```typescript
// chatbot.service.ts
interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  metadata?: any;
}

class ChatbotService {
  sendMessage(message: string): Observable<ChatMessage>
  getChatHistory(): Observable<ChatMessage[]>
  clearHistory(): Observable<void>
}
```

### Backend (AWS Lambda)
- **Runtime**: Node.js 18.x
- **Framework**: Express.js or serverless-express
- **AI Integration**: OpenAI GPT-4 or Anthropic Claude
- **Resume Data**: Structured JSON with all resume information
- **Context Management**: Maintain conversation context

### Lambda Function Features
1. **Resume Context**: Pre-loaded with structured resume data
2. **Conversation Memory**: Maintain chat history in DynamoDB
3. **Rate Limiting**: Prevent abuse
4. **Error Handling**: Graceful fallbacks
5. **Logging**: CloudWatch integration

## Infrastructure Setup

### AWS Resources
1. **S3 Bucket**: Static website hosting
2. **CloudFront**: CDN and HTTPS
3. **Lambda Function**: Chatbot backend
4. **API Gateway**: REST API for Lambda
5. **DynamoDB**: Chat history storage
6. **IAM Roles**: Proper permissions
7. **Route 53**: Custom domain (optional)

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy Portfolio
on:
  push:
    branches: [main]

jobs:
  build:
    - name: Build Angular app
    - name: Deploy to S3
    - name: Invalidate CloudFront cache
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Angular project setup
- [ ] Basic routing and components
- [ ] Tailwind CSS integration
- [ ] Responsive layout
- [ ] Basic styling and theming

### Phase 2: Public Sections (Week 3-4)
- [ ] Landing page and hero section
- [ ] About me section
- [ ] Skills and technologies
- [ ] Projects portfolio
- [ ] Contact form
- [ ] Navigation and footer

### Phase 3: Authentication (Week 5)
- [ ] Auth0 integration
- [ ] Protected routes
- [ ] User dashboard
- [ ] Authentication guards
- [ ] User profile management

### Phase 4: Chatbot Backend (Week 6)
- [ ] Lambda function setup
- [ ] OpenAI/Claude integration
- [ ] Resume data structuring
- [ ] API Gateway configuration
- [ ] DynamoDB setup

### Phase 5: Chatbot Frontend (Week 7)
- [ ] Chat interface component
- [ ] Real-time messaging
- [ ] Chat history
- [ ] Error handling
- [ ] Loading states

### Phase 6: Deployment & Polish (Week 8)
- [ ] S3 and CloudFront setup
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Testing and bug fixes

## Technical Considerations

### Performance
- Lazy loading for routes
- Image optimization
- Code splitting
- Service worker for caching
- CDN for static assets

### Security
- HTTPS everywhere
- CSP headers
- Input validation
- Rate limiting on API
- Secure environment variables

### SEO
- Meta tags and Open Graph
- Structured data (JSON-LD)
- Sitemap generation
- Robots.txt
- Page speed optimization

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

## Environment Configuration

### Development
```typescript
// environment.ts
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

### Production
```typescript
// environment.prod.ts
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

## Monitoring & Analytics

### Frontend
- Google Analytics 4
- Error tracking (Sentry)
- Performance monitoring
- User behavior analytics

### Backend
- CloudWatch logs
- Lambda metrics
- API Gateway monitoring
- DynamoDB metrics

## Future Enhancements

### Phase 2 Features
- Blog section
- Newsletter subscription
- Dark/light theme toggle
- Multi-language support
- Advanced chatbot features (file upload, voice)

### Phase 3 Features
- Admin panel
- Content management system
- Analytics dashboard
- A/B testing capabilities
- Advanced SEO tools

## Budget Considerations

### Monthly Costs (Estimated)
- **S3**: $0.50-2.00
- **CloudFront**: $1.00-5.00
- **Lambda**: $1.00-10.00
- **DynamoDB**: $1.00-5.00
- **Auth0**: $23.00 (Developer plan)
- **Domain**: $12.00/year
- **Total**: ~$30-45/month

## Success Metrics

### Technical
- Page load time < 3 seconds
- Lighthouse score > 90
- 99.9% uptime
- Zero security vulnerabilities

### Business
- Increased professional visibility
- More job opportunities
- Higher engagement rates
- Positive user feedback

This plan provides a comprehensive roadmap for building a professional, feature-rich portfolio site that showcases your skills while providing an innovative chatbot assistant for visitors.
