// Lambda function for portfolio chatbot using OpenAI Assistant
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const https = require('https');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID;

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    try {
        // Handle CORS preflight requests
        if (event.httpMethod === 'OPTIONS' || event.requestContext?.http?.method === 'OPTIONS') {
            console.log('Handling OPTIONS request');
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
        
        // Parse the request body
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch (parseError) {
            console.error('Error parsing body:', parseError);
            body = {};
        }
        
        const { message, userId = 'anonymous', sessionId = 'default' } = body;
        
        console.log('Parsed body:', { message, userId, sessionId });
        
        if (!message) {
            console.log('No message provided, returning 400');
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        console.log('Processing message:', message);
        
        // For now, return a simple response to test the connection
        const response = "Hello! I'm Michael's AI assistant. I'm currently being set up to help answer questions about Michael's experience and projects. Please try again in a moment, or feel free to contact Michael directly for information about his background and work.";
        
        console.log('Returning response:', response);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: response,
                timestamp: new Date().toISOString()
            })
        };
        
    } catch (error) {
        console.error('Handler Error:', error);
        
        // Fallback response
        const fallbackResponse = "I'm temporarily unavailable. Please try again in a moment, or feel free to contact Michael directly for information about his experience and projects.";
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: fallbackResponse,
                timestamp: new Date().toISOString()
            })
        };
    }
};
