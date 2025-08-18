const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const LOGIN_EVENTS_TABLE = 'LoginEvents';

// Historical test data with various timestamps
const historicalData = [
  {
    eventId: 'login_1755360000000_test_1',
    userId: 'auth0|test123',
    email: 'michael@michaelcopeland.com',
    name: 'Michael Copeland',
    timestamp: '2025-08-15T10:30:00.000Z', // Yesterday
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ipAddress: '192.168.1.100',
    referer: 'https://google.com',
    eventType: 'login',
    language: 'en-US',
    platform: 'MacIntel',
    screenResolution: '1920x1080',
    timezone: 'America/New_York',
    url: 'https://michaelcopeland.com'
  },
  {
    eventId: 'login_1755273600000_test_2',
    userId: 'auth0|test123',
    email: 'michael@michaelcopeland.com',
    name: 'Michael Copeland',
    timestamp: '2025-08-14T14:15:00.000Z', // 2 days ago
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
    ipAddress: '192.168.1.101',
    referer: 'https://linkedin.com',
    eventType: 'login',
    language: 'en-US',
    platform: 'iPhone',
    screenResolution: '375x667',
    timezone: 'America/New_York',
    url: 'https://michaelcopeland.com'
  },
  {
    eventId: 'login_1755187200000_test_3',
    userId: 'auth0|test123',
    email: 'michael@michaelcopeland.com',
    name: 'Michael Copeland',
    timestamp: '2025-08-13T09:45:00.000Z', // 3 days ago
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ipAddress: '192.168.1.102',
    referer: 'https://github.com',
    eventType: 'login',
    language: 'en-US',
    platform: 'Win32',
    screenResolution: '2560x1440',
    timezone: 'America/New_York',
    url: 'https://michaelcopeland.com'
  },
  {
    eventId: 'login_1755100800000_test_4',
    userId: 'auth0|test123',
    email: 'michael@michaelcopeland.com',
    name: 'Michael Copeland',
    timestamp: '2025-08-12T16:20:00.000Z', // 4 days ago
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X)',
    ipAddress: '192.168.1.103',
    referer: 'https://twitter.com',
    eventType: 'login',
    language: 'en-US',
    platform: 'iPad',
    screenResolution: '1024x768',
    timezone: 'America/New_York',
    url: 'https://michaelcopeland.com'
  },
  {
    eventId: 'login_1755014400000_test_5',
    userId: 'auth0|test123',
    email: 'michael@michaelcopeland.com',
    name: 'Michael Copeland',
    timestamp: '2025-08-11T11:10:00.000Z', // 5 days ago
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    ipAddress: '192.168.1.104',
    referer: 'https://stackoverflow.com',
    eventType: 'login',
    language: 'en-US',
    platform: 'Linux x86_64',
    screenResolution: '1920x1200',
    timezone: 'America/New_York',
    url: 'https://michaelcopeland.com'
  }
];

async function addHistoricalData() {
  console.log('Adding historical test data...');
  
  for (const event of historicalData) {
    try {
      const putCommand = new PutCommand({
        TableName: LOGIN_EVENTS_TABLE,
        Item: event
      });
      
      await docClient.send(putCommand);
      console.log(`Added event: ${event.eventId} - ${event.timestamp}`);
    } catch (error) {
      console.error(`Error adding event ${event.eventId}:`, error);
    }
  }
  
  console.log('Historical data addition complete!');
}

addHistoricalData().catch(console.error);
