const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize AWS clients
const sesClient = new SESClient({ region: 'us-east-1' });
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@michaelcopeland.com';
const TO_EMAIL = process.env.TO_EMAIL || 'michael@michaelcopeland.com';
const CONTACT_SUBMISSIONS_TABLE = 'ContactSubmissions';

exports.handler = async (event) => {
            console.log('Event received:', JSON.stringify(event, null, 2));
        console.log('Environment variables - FROM_EMAIL:', process.env.FROM_EMAIL, 'TO_EMAIL:', process.env.TO_EMAIL);
    
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
        
        const { name, email, subject, message } = body;
        
        console.log('Parsed form data:', { name, email, subject, message });
        
        // Validate required fields
        if (!name || !email || !message) {
            console.log('Missing required fields');
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Missing required fields: name, email, and message are required' 
                })
            };
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format');
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ error: 'Invalid email format' })
            };
        }
        
        // Create submission record for DynamoDB
        const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = new Date().toISOString();
        
        const submissionRecord = {
            submissionId: submissionId,
            name: name,
            email: email,
            subject: subject || 'Contact Form Submission',
            message: message,
            timestamp: timestamp,
            status: 'pending'
        };
        
        // Store in DynamoDB
        try {
            const putCommand = new PutCommand({
                TableName: CONTACT_SUBMISSIONS_TABLE,
                Item: submissionRecord
            });
            
            await docClient.send(putCommand);
            console.log('Stored submission in DynamoDB:', submissionId);
        } catch (dbError) {
            console.error('Error storing in DynamoDB:', dbError);
            // Continue with email sending even if DB fails
        }
        
        // Send email via SES
        try {
            const emailParams = {
                Source: FROM_EMAIL,
                Destination: {
                    ToAddresses: [TO_EMAIL]
                },
                Message: {
                    Subject: {
                        Data: `New Contact Form Submission: ${subject || 'Portfolio Contact'}`
                    },
                    Body: {
                        Text: {
                            Data: `
New contact form submission received:

Name: ${name}
Email: ${email}
Subject: ${subject || 'Portfolio Contact'}
Message: ${message}

Submitted at: ${timestamp}
Submission ID: ${submissionId}
                            `.trim()
                        },
                        Html: {
                            Data: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #1e40af; }
        .value { margin-top: 5px; }
        .message-box { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
        </div>
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">${name}</div>
            </div>
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">${email}</div>
            </div>
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">${subject || 'Portfolio Contact'}</div>
            </div>
            <div class="field">
                <div class="label">Message:</div>
                <div class="message-box">${message.replace(/\n/g, '<br>')}</div>
            </div>
            <hr style="margin: 20px 0;">
            <div style="font-size: 12px; color: #666;">
                <div>Submitted at: ${timestamp}</div>
                <div>Submission ID: ${submissionId}</div>
            </div>
        </div>
    </div>
</body>
</html>
                            `.trim()
                        }
                    }
                }
            };
            
            const sendEmailCommand = new SendEmailCommand(emailParams);
            await sesClient.send(sendEmailCommand);
            console.log('Email sent successfully');
            
            // Update status in DynamoDB
            try {
                const updateCommand = new PutCommand({
                    TableName: CONTACT_SUBMISSIONS_TABLE,
                    Item: {
                        ...submissionRecord,
                        status: 'sent'
                    }
                });
                await docClient.send(updateCommand);
                console.log('Updated submission status to sent');
            } catch (updateError) {
                console.error('Error updating submission status:', updateError);
            }
            
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            
            // Update status in DynamoDB
            try {
                const updateCommand = new PutCommand({
                    TableName: CONTACT_SUBMISSIONS_TABLE,
                    Item: {
                        ...submissionRecord,
                        status: 'failed'
                    }
                });
                await docClient.send(updateCommand);
                console.log('Updated submission status to failed');
            } catch (updateError) {
                console.error('Error updating submission status:', updateError);
            }
            
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    error: 'Failed to send email. Please try again later.' 
                })
            };
        }
        
        console.log('Contact form submission processed successfully');
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Thank you for your message! I will get back to you soon.',
                submissionId: submissionId
            })
        };
        
    } catch (error) {
        console.error('Handler Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'An unexpected error occurred. Please try again later.'
            })
        };
    }
};
