// Test Redis connection and basic operations
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

async function testRedis() {
  console.log('Testing Redis connection...');
  console.log('Redis Host:', process.env.REDIS_HOST || 'localhost');
  console.log('Redis Port:', process.env.REDIS_PORT || 6379);
  console.log('Redis Username:', process.env.REDIS_USERNAME || 'default');
  console.log('Redis Password:', process.env.REDIS_PASSWORD ? '**** (hidden)' : 'None');
  
  // Create Redis client using the same configuration as the main app
  const redisClient = redis.createClient({
    url: `redis://default:${process.env.REDIS_PASSWORD || ''}@${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

  try {
    // Connect to Redis
    await redisClient.connect();
    console.log('✅ Connected to Redis successfully');

    // Test basic operations
    console.log('\n--- Testing Basic Operations ---');
    
    // Set a value
    await redisClient.set('test-key', 'test-value');
    console.log('✅ SET operation successful');
    
    // Get the value
    const value = await redisClient.get('test-key');
    console.log('✅ GET operation successful:', value);
    
    // Test list operations (used by notifications)
    await redisClient.lPush('test-list', JSON.stringify({ id: 1, message: 'Test notification 1' }));
    await redisClient.lPush('test-list', JSON.stringify({ id: 2, message: 'Test notification 2' }));
    console.log('✅ List LPUSH operations successful');
    
    // Get list items
    const listItems = await redisClient.lRange('test-list', 0, -1);
    console.log('✅ List LRANGE operations successful:', listItems.map(item => JSON.parse(item)));
    
    // Test publish/subscribe
    console.log('\n--- Testing Pub/Sub ---');
    
    // Create subscriber client
    const subscriber = redisClient.duplicate();
    
    // Subscribe to a test channel
    await subscriber.connect();
    await subscriber.subscribe('test-channel', (message) => {
      console.log('✅ Received message from test-channel:', message);
    });
    console.log('✅ Subscribed to test-channel');
    
    // Publish a message
    await redisClient.publish('test-channel', 'Hello from Redis!');
    console.log('✅ Published message to test-channel');
    
    // Wait a moment for the message to be received
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clean up
    await subscriber.quit();
    
    // Clean up test keys
    await redisClient.del('test-key');
    await redisClient.del('test-list');
    console.log('✅ Cleaned up test keys');
    
    // Get Redis server info
    try {
      const info = await redisClient.info();
      console.log('\n--- Redis Server Info ---');
      const infoLines = info.split('\n');
      const versionLine = infoLines.find(line => line.startsWith('redis_version:'));
      const clientsLine = infoLines.find(line => line.startsWith('connected_clients:'));
      const memoryLine = infoLines.find(line => line.startsWith('used_memory_human:'));
      
      console.log('Redis version:', versionLine ? versionLine.split(':')[1] : 'Unknown');
      console.log('Connected clients:', clientsLine ? clientsLine.split(':')[1] : 'Unknown');
      console.log('Used memory:', memoryLine ? memoryLine.split(':')[1] : 'Unknown');
    } catch (infoError) {
      console.log('Could not retrieve Redis server info:', infoError.message);
    }
    
    // Close connection
    await redisClient.quit();
    console.log('\n✅ Disconnected from Redis');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    
    // Try to close connection even if there was an error
    try {
      await redisClient.quit();
    } catch (quitError) {
      console.error('Error closing Redis connection:', quitError);
    }
    
    process.exit(1);
  }
}

// Run the test
testRedis();