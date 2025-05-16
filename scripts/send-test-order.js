// Simple script to send a test order event to Inngest
const { inngest } = require('../config/inngest');
require('dotenv').config({ path: '.env.local' });

async function sendTestOrderEvent() {
  try {
    console.log('Environment variables:');
    console.log('INNGEST_EVENT_KEY:', process.env.INNGEST_EVENT_KEY ? '(set)' : '(not set)');
    console.log('INNGEST_ENDPOINT:', process.env.INNGEST_ENDPOINT || '(using default)');
    
    console.log('\nSending test order event to Inngest...');
    
    // Create a simple test order event
    const result = await inngest.send({
      name: 'order/created',
      data: {
        orderId: 'test-order-' + Date.now(),
        userId: 'test-user-id',
        itemCount: 3,
        orderTotal: 99.99,
        orderDate: Date.now(),
        status: 'new'
      }
    });
    
    console.log('Test order event sent successfully!');
    console.log('Result:', result);
    console.log('Check your Inngest dashboard to see if the event was processed.');
    
  } catch (error) {
    console.error('Failed to send test order event:');
    console.error(error.message);
    console.error(error.stack);
  }
}

sendTestOrderEvent(); 