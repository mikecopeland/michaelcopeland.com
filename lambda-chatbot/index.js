// Lambda function for portfolio chatbot using OpenAI Assistant
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// OpenAI configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID; // You'll need to set this in Lambda environment variables
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

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
        
        // Get or create a thread for this user session
        const threadId = await getOrCreateThread(userId, sessionId);
        
        // Add the user's message to the thread
        await addMessageToThread(threadId, message);
        
        // Run the assistant
        const response = await runAssistant(threadId);
        
        // Save conversation to DynamoDB (optional)
        try {
            await saveMessage(userId, sessionId, 'user', message);
            await saveMessage(userId, sessionId, 'assistant', response);
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

async function getOrCreateThread(userId, sessionId) {
    const threadKey = `${userId}-${sessionId}`;
    
    try {
        // Try to get existing thread from DynamoDB
        const existingThread = await getThreadFromDB(threadKey);
        if (existingThread) {
            return existingThread.threadId;
        }
        
        // Create new thread
        const response = await fetch(`${OPENAI_BASE_URL}/threads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create thread: ${response.status} ${response.statusText}`);
        }
        
        const thread = await response.json();
        
        // Save thread to DynamoDB
        await saveThreadToDB(threadKey, thread.id);
        
        return thread.id;
    } catch (error) {
        console.error('Error managing thread:', error);
        throw error;
    }
}

async function addMessageToThread(threadId, message) {
    const response = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            role: 'user',
            content: message
        })
    });
    
    if (!response.ok) {
        throw new Error(`Failed to add message: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
}

async function runAssistant(threadId) {
    // Create a run
    const runResponse = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
            assistant_id: ASSISTANT_ID
        })
    });
    
    if (!runResponse.ok) {
        throw new Error(`Failed to create run: ${runResponse.status} ${runResponse.statusText}`);
    }
    
    const run = await runResponse.json();
    
    // Poll for completion
    let runStatus = run;
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;
    
    while (runStatus.status === 'queued' || runStatus.status === 'in_progress') {
        if (attempts >= maxAttempts) {
            throw new Error('Assistant run timed out');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const statusResponse = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/runs/${run.id}`, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        if (!statusResponse.ok) {
            throw new Error(`Failed to get run status: ${statusResponse.status} ${statusResponse.statusText}`);
        }
        
        runStatus = await statusResponse.json();
        attempts++;
    }
    
    if (runStatus.status === 'completed') {
        // Get the messages
        const messagesResponse = await fetch(`${OPENAI_BASE_URL}/threads/${threadId}/messages`, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        if (!messagesResponse.ok) {
            throw new Error(`Failed to get messages: ${messagesResponse.status} ${messagesResponse.statusText}`);
        }
        
        const messages = await messagesResponse.json();
        
        // Get the latest assistant message
        const assistantMessage = messages.data.find(msg => msg.role === 'assistant');
        if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
            return assistantMessage.content[0].text.value;
        }
    }
    
    throw new Error(`Assistant run failed with status: ${runStatus.status}`);
}

async function getThreadFromDB(threadKey) {
    try {
        const command = new QueryCommand({
            TableName: 'ChatThreads',
            KeyConditionExpression: 'threadKey = :threadKey',
            ExpressionAttributeValues: {
                ':threadKey': threadKey
            }
        });
        
        const result = await docClient.send(command);
        return result.Items && result.Items.length > 0 ? result.Items[0] : null;
    } catch (error) {
        console.error('Error getting thread from DB:', error);
        return null;
    }
}

async function saveThreadToDB(threadKey, threadId) {
    try {
        const command = new PutCommand({
            TableName: 'ChatThreads',
            Item: {
                threadKey: threadKey,
                threadId: threadId,
                createdAt: new Date().toISOString()
            }
        });
        
        await docClient.send(command);
    } catch (error) {
        console.error('Error saving thread to DB:', error);
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
