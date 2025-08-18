const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const LOGIN_EVENTS_TABLE = 'LoginEvents';

// Helper function to extract IP address from different API Gateway event structures
function extractIpAddress(event) {
    console.log('Extracting IP address from event structure:', JSON.stringify(event.requestContext, null, 2));
    
    // Try different possible locations for IP address
    const possiblePaths = [
        'requestContext.identity.sourceIp',
        'requestContext.http.sourceIp',
        'requestContext.identity.clientCert.clientCertValidity.notAfter',
        'headers.x-forwarded-for',
        'headers.x-real-ip',
        'headers.x-client-ip'
    ];
    
    for (const path of possiblePaths) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], event);
        if (value && value !== 'unknown') {
            console.log(`Found IP address at ${path}:`, value);
            return value;
        }
    }
    
    console.log('No IP address found in event, using unknown');
    return 'unknown';
}

exports.handler = async (event) => {
    console.log('=== LOGIN TRACKING LAMBDA STARTED ===');
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
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }
        
        const { action, userData, browserData } = body;
        
        console.log('Parsed request:', { action, userData, browserData });
        
        if (action === 'track_login') {
            // Track a new login event
            const loginEvent = {
                eventId: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: userData.sub || 'unknown',
                email: userData.email || 'unknown',
                name: userData.name || 'Unknown User',
                timestamp: new Date().toISOString(),
                userAgent: browserData?.userAgent || event.headers?.['User-Agent'] || 'unknown',
                ipAddress: extractIpAddress(event),
                referer: browserData?.referer || event.headers?.['Referer'] || 'unknown',
                eventType: 'login',
                // Additional browser data
                language: browserData?.language || 'unknown',
                platform: browserData?.platform || 'unknown',
                screenResolution: browserData?.screenResolution || 'unknown',
                timezone: browserData?.timezone || 'unknown',
                url: browserData?.url || 'unknown'
            };
            
            console.log('Login event to store:', loginEvent);
            
            try {
                const putCommand = new PutCommand({
                    TableName: LOGIN_EVENTS_TABLE,
                    Item: loginEvent
                });
                
                await docClient.send(putCommand);
                console.log('Login event stored:', loginEvent.eventId);
                
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Login tracked successfully',
                        eventId: loginEvent.eventId
                    })
                };
            } catch (dbError) {
                console.error('Error storing login event:', dbError);
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Failed to track login event' })
                };
            }
        } else if (action === 'get_analytics') {
            // Get login analytics
            try {
                const scanCommand = new ScanCommand({
                    TableName: LOGIN_EVENTS_TABLE,
                    Limit: 1000 // Adjust as needed
                });
                
                const { Items } = await docClient.send(scanCommand);
                
                // Process analytics
                const analytics = {
                    totalLogins: Items.length,
                    uniqueUsers: new Set(Items.map(item => item.userId)).size,
                    recentLogins: Items
                        .filter(item => {
                            const loginTime = new Date(item.timestamp);
                            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return loginTime > oneWeekAgo;
                        })
                        .length,
                    topUsers: Items.reduce((acc, item) => {
                        acc[item.email] = (acc[item.email] || 0) + 1;
                        return acc;
                    }, {}),
                    loginHistory: Items
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .slice(0, 50) // Last 50 logins
                };
                
                return {
                    statusCode: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(analytics)
                };
            } catch (dbError) {
                console.error('Error retrieving analytics:', dbError);
                return {
                    statusCode: 500,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ error: 'Failed to retrieve analytics' })
                };
            }
        } else {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Invalid action specified' })
            };
        }
        
    } catch (error) {
        console.error('Handler Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
};
