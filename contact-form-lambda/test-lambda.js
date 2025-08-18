const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({ region: 'us-east-1' });

const testEvent = {
  body: JSON.stringify({
    name: "Test User",
    email: "test@example.com",
    subject: "Test Subject",
    message: "This is a test message"
  })
};

const params = {
  FunctionName: 'portfolio-contact-form',
  Payload: JSON.stringify(testEvent)
};

lambda.invoke(params, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Response:', JSON.parse(data.Payload));
  }
});
