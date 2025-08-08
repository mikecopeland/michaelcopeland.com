// Production environment
export const environment = {
  production: true,
  auth0: {
    domain: 'dev-7xs3j6cka4d018zf.us.auth0.com',
    clientId: 'FKKhFkESaDpY36ZBd3oOnnj7QF4U69SX',
    audience: undefined
  },
  apiUrl: 'https://api.michaelcopeland.com',
  chatbotApiUrl: 'https://m27rj9fme2.execute-api.us-east-1.amazonaws.com/prod/chat' // Lambda API Gateway
};
