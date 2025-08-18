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
        
        let threadId;
        const threadKey = `${userId}#${sessionId}`;

        // 1. Retrieve existing thread or create a new one
        try {
            const getCommand = new QueryCommand({
                TableName: 'ChatThreads',
                KeyConditionExpression: 'threadKey = :threadKey',
                ExpressionAttributeValues: {
                    ':threadKey': threadKey
                }
            });
            const { Items } = await docClient.send(getCommand);
            if (Items && Items.length > 0 && Items[0].threadId) {
                threadId = Items[0].threadId;
                console.log('Retrieved existing thread:', threadId);
            } else {
                console.log('Creating new thread...');
                const createThreadOptions = {
                    hostname: 'api.openai.com',
                    path: '/v1/threads',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'OpenAI-Beta': 'assistants=v2'
                    }
                };
                const thread = await makeRequest(createThreadOptions);
                threadId = thread.data.id;
                console.log('Created new thread:', threadId);

                const putCommand = new PutCommand({
                    TableName: 'ChatThreads',
                    Item: {
                        threadKey: threadKey,
                        threadId: threadId,
                        createdAt: new Date().toISOString()
                    }
                });
                await docClient.send(putCommand);
            }
        } catch (dbError) {
            console.error('Error managing DynamoDB thread:', dbError);
            // Fallback: create a new thread without persisting if DB fails
            console.log('Creating new thread (DB fallback)...');
            const createThreadOptions = {
                hostname: 'api.openai.com',
                path: '/v1/threads',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            };
            const thread = await makeRequest(createThreadOptions);
            threadId = thread.data.id;
            console.log('Created new thread (DB fallback):', threadId);
        }

        // 2. Add a message to the thread
        console.log('Adding message to thread:', message);
        const addMessageOptions = {
            hostname: 'api.openai.com',
            path: `/v1/threads/${threadId}/messages`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        };
        await makeRequest(addMessageOptions, { role: "user", content: message });

        // 3. Run the assistant
        console.log('Running assistant...');
        const createRunOptions = {
            hostname: 'api.openai.com',
            path: `/v1/threads/${threadId}/runs`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        };
        let run = await makeRequest(createRunOptions, { assistant_id: ASSISTANT_ID });
        console.log('Run created:', run.data.id, 'Status:', run.data.status);

        // 4. Poll for the run completion
        while (run.data.status === "queued" || run.data.status === "in_progress" || run.data.status === "cancelling") {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            const retrieveRunOptions = {
                hostname: 'api.openai.com',
                path: `/v1/threads/${threadId}/runs/${run.data.id}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            };
            run = await makeRequest(retrieveRunOptions);
            console.log('Polling run status:', run.data.status);
        }

        // 5. Get the latest messages
        console.log('Retrieving messages...');
        const listMessagesOptions = {
            hostname: 'api.openai.com',
            path: `/v1/threads/${threadId}/messages`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        };
        const messages = await makeRequest(listMessagesOptions);

        const assistantResponse = messages.data.data
            .filter(msg => msg.role === 'assistant')
            .map(msg => msg.content[0].text.value)
            .pop() || "Sorry, I couldn't generate a response at this time.";

        console.log('Assistant response:', assistantResponse);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response: assistantResponse,
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
