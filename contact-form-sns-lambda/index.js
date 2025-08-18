const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({ region: "us-east-1" });

// SNS Topic ARN - you'll need to create this
const EMAIL_TOPIC_ARN = process.env.EMAIL_TOPIC_ARN;
const SMS_TOPIC_ARN = process.env.SMS_TOPIC_ARN; // Optional for SMS notifications

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Handle CORS preflight request
    if (event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: ''
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (parseError) {
        console.error('JSON parsing error:', parseError);
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

    // Validate required fields
    if (!name || !email || !subject || !message) {
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ error: 'Missing required fields' })
        };
    }

    try {
        // Create email message
        const emailMessage = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from michaelcopeland.com
Timestamp: ${new Date().toISOString()}
IP Address: ${event.requestContext?.http?.sourceIp || 'Unknown'}
        `.trim();

        // Send email notification via SNS
        if (EMAIL_TOPIC_ARN) {
            const emailParams = {
                TopicArn: EMAIL_TOPIC_ARN,
                Subject: `New Contact Form: ${subject}`,
                Message: emailMessage
            };

            await sns.send(new PublishCommand(emailParams));
            console.log('Email notification sent successfully');
        }

        // Optional: Send SMS notification
        if (SMS_TOPIC_ARN) {
            const smsMessage = `New contact form from ${name}: ${subject}`;
            const smsParams = {
                TopicArn: SMS_TOPIC_ARN,
                Message: smsMessage,
                MessageAttributes: {
                    'AWS.SNS.SMS.SMSType': {
                        DataType: 'String',
                        StringValue: 'Transactional'
                    }
                }
            };

            await sns.send(new PublishCommand(smsParams));
            console.log('SMS notification sent successfully');
        }

        // Store in DynamoDB for analytics (optional)
        // You could add DynamoDB storage here if needed

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Contact form submitted successfully',
                success: true
            })
        };

    } catch (error) {
        console.error('Error sending notification:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to process contact form submission',
                success: false
            })
        };
    }
};
