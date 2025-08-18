const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({ region: 'us-east-1' });

const testEvent = {
  body: JSON.stringify({
    message: "Hello, can you tell me about Michael's experience?",
    userId: "test-user",
    sessionId: "test-session"
  })
};

const params = {
  FunctionName: 'portfolio-chatbot',
  Payload: JSON.stringify(testEvent)
};

lambda.invoke(params, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Response:', JSON.parse(data.Payload));
  }
});
