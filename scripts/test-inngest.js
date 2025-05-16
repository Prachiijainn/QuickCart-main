// Test script for Inngest connection
const { inngest } = require('../config/inngest');

async function testInngestConnection() {
  try {
    console.log('Sending test event to Inngest...');
    
    const result = await inngest.send({
      name: 'test/connection',
      data: {
        message: 'Hello from QuickCart!',
        timestamp: Date.now()
      }
    });
    
    console.log('Event sent successfully!');
    console.log('Result:', result);
    console.log('If you see this message, the connection to Inngest is working.');
    console.log('Check your Inngest dashboard to see if the event was received.');
    
  } catch (error) {
    console.error('Failed to send event to Inngest:');
    console.error(error);
    console.error('\nPossible solutions:');
    console.error('1. Check your .env.local file for INNGEST_ENDPOINT and INNGEST_EVENT_KEY');
    console.error('2. Make sure your Next.js server is running');
    console.error('3. Make sure your Inngest dev server is running (npm run inngest:dev)');
    console.error('4. Ensure your app is accessible via a public URL (e.g., using ngrok)');
  }
}

testInngestConnection(); 