const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Resume data for context (you can also store this in DynamoDB or S3)
const RESUME_CONTEXT = `
You are an AI assistant representing Michael Copeland, a software developer. 
Here's information about Michael based on his resume:

PROFESSIONAL EXPERIENCE:
- Senior Software Engineer with experience in full-stack development
- Expertise in Angular, React, Node.js, Python, and AWS
- Experience with cloud architecture and DevOps practices
- Strong background in API development and database design

SKILLS:
- Frontend: Angular, React, TypeScript, HTML/CSS, Tailwind CSS
- Backend: Node.js, Python, Java, REST APIs, GraphQL
- Cloud: AWS (Lambda, S3, DynamoDB, CloudFront), Azure
- Databases: PostgreSQL, MongoDB, DynamoDB
- DevOps: Docker, CI/CD, GitHub Actions

EDUCATION:
- Computer Science background
- Continuous learner with focus on modern web technologies

Please answer questions about Michael's background, skills, and experience in a professional yet friendly manner.
If asked about something not in his background, politely redirect to his actual experience.
`;

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
            },
            body: ''
        };
    }
    
    try {
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { message, userId = 'anonymous', sessionId = 'default' } = body;
        
        if (!message) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Message is required' })
            };
        }
        
        // Get chat history for context (don't let this fail the whole request)
        let chatHistory = [];
        try {
            chatHistory = await getChatHistory(userId, sessionId);
        } catch (historyError) {
            console.warn('Could not retrieve chat history:', historyError);
        }
        
        // Prepare messages for OpenAI
        const messages = [
            { role: 'system', content: RESUME_CONTEXT },
            ...chatHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];
        
        // Call OpenAI API (this now has its own error handling and fallbacks)
        const aiResponse = await callOpenAI(messages);
        
        // Save conversation to DynamoDB (don't let this fail the response)
        try {
            await saveMessage(userId, sessionId, 'user', message);
            await saveMessage(userId, sessionId, 'assistant', aiResponse);
        } catch (saveError) {
            console.warn('Could not save conversation:', saveError);
        }
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: aiResponse,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Handler Error:', error);
        
        // Provide a fallback response even if everything fails
        const fallbackMessage = getFallbackResponse([{ role: 'user', content: event.body ? JSON.parse(event.body).message || 'hello' : 'hello' }]);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: fallbackMessage,
                timestamp: new Date().toISOString()
            })
        };
    }
};

async function callOpenAI(messages) {
    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API error: ${response.status} ${response.statusText}`, errorText);
            
            // If rate limited or API unavailable, return a fallback response
            if (response.status === 429 || response.status >= 500) {
                return getFallbackResponse(messages);
            }
            
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        // Return fallback response on any error
        return getFallbackResponse(messages);
    }
}

function getFallbackResponse(messages) {
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Simple keyword-based responses
    if (userMessage.includes('experience') || userMessage.includes('background')) {
        return "Michael has over 21 years of experience in software development, specializing in full-stack development with technologies like Angular, React, Node.js, Python, and AWS. He has worked on various projects including refugee assistance systems, mobile applications, and cloud-based solutions.";
    } else if (userMessage.includes('skill') || userMessage.includes('technology')) {
        return "Michael's technical skills include: Frontend (Angular, React, TypeScript), Backend (Node.js, Python, Java), Cloud (AWS Lambda, S3, DynamoDB, CloudFront), and DevOps (Docker, CI/CD, GitHub Actions). He's also experienced with databases like PostgreSQL, MongoDB, and DynamoDB.";
    } else if (userMessage.includes('project')) {
        return "Some of Michael's notable projects include the Refugee Arrivals Data System, Service Locator Mobile App, Survey System for Refugees, and various web applications built with modern frameworks and deployed on AWS infrastructure.";
    } else if (userMessage.includes('education') || userMessage.includes('learning')) {
        return "Michael has a strong Computer Science background and is a continuous learner who stays current with modern web technologies and best practices in software development.";
    } else {
        return "Hello! I'm Michael's AI assistant. I can help you learn about his 21+ years of software development experience, technical skills including Angular, React, Node.js, Python, and AWS, as well as his various projects. What would you like to know more about?";
    }
}

async function getChatHistory(userId, sessionId, limit = 10) {
    try {
        const command = new QueryCommand({
            TableName: 'ChatHistory',
            KeyConditionExpression: 'userId = :userId AND begins_with(sessionId, :sessionId)',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':sessionId': sessionId
            },
            ScanIndexForward: false, // Get most recent first
            Limit: limit * 2 // Get both user and assistant messages
        });
        
        const result = await docClient.send(command);
        return result.Items || [];
    } catch (error) {
        console.error('Error getting chat history:', error);
        return [];
    }
}

async function saveMessage(userId, sessionId, role, content) {
    try {
        const command = new PutCommand({
            TableName: 'ChatHistory',
            Item: {
                userId: userId,
                sessionId: `${sessionId}#${Date.now()}`,
                role: role,
                content: content,
                timestamp: new Date().toISOString()
            }
        });
        
        await docClient.send(command);
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

