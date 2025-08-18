const https = require('https');

// Test the SNS contact form Lambda function
async function testContactForm() {
    const testData = {
        name: "Test User",
        email: "test@example.com",
        subject: "SNS Integration Test",
        message: "This is a test message to verify SNS notifications are working properly. Please ignore this message."
    };

    const postData = JSON.stringify(testData);

    const options = {
        hostname: 'YOUR_API_ID.execute-api.us-east-1.amazonaws.com', // Replace with your actual API ID
        port: 443,
        path: '/contact',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                console.log('Status Code:', res.statusCode);
                console.log('Response Headers:', res.headers);
                console.log('Response Body:', data);
                resolve({ statusCode: res.statusCode, data: data });
            });
        });

        req.on('error', (error) => {
            console.error('Request Error:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Run the test
console.log('🧪 Testing SNS Contact Form...');
testContactForm()
    .then(result => {
        if (result.statusCode === 200) {
            console.log('✅ Test successful! Check your email/SMS for notifications.');
        } else {
            console.log('❌ Test failed with status code:', result.statusCode);
        }
    })
    .catch(error => {
        console.error('❌ Test failed:', error);
    });
