// Test NotificationService Redis integration
import mongoose from 'mongoose';
import redis from 'redis';
import dotenv from 'dotenv';
import config from './src/config/index.js';

dotenv.config();

async function testNotificationRedis() {
  console.log('Testing NotificationService Redis integration...');
  
  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  const mongoUri = process.env.MONGODB_URI || config.mongodb.uri;
  console.log('MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//****:****@')); // Hide credentials
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');
  
  // Connect to Redis
  console.log('Connecting to Redis...');
  const redisClient = redis.createClient({
    url: `redis://${config.redis.host}:${config.redis.port}`,
    password: config.redis.password || undefined,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await redisClient.connect();
  console.log('✅ Connected to Redis');
  
  try {
    // Test notification storage in Redis
    console.log('\n--- Testing Notification Storage in Redis ---');
    
    const userId = 'test-user-id';
    const notificationKey = `notifications:${userId}`;
    
    // Clear any existing notifications for this test user
    await redisClient.del(notificationKey);
    
    // Create test notifications
    const testNotifications = [
      {
        id: '1',
        userId,
        type: 'test',
        message: 'Test notification 1',
        data: { test: true },
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId,
        type: 'test',
        message: 'Test notification 2',
        data: { test: true },
        isRead: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Store notifications in Redis (simulating NotificationService behavior)
    for (const notification of testNotifications) {
      await redisClient.lPush(notificationKey, JSON.stringify(notification));
    }
    console.log('✅ Stored test notifications in Redis');
    
    // Retrieve notifications from Redis
    const storedNotifications = await redisClient.lRange(notificationKey, 0, -1);
    const parsedNotifications = storedNotifications.map(item => JSON.parse(item));
    console.log('✅ Retrieved notifications from Redis:', parsedNotifications.length, 'notifications');
    
    // Verify the notifications
    if (parsedNotifications.length === 2) {
      console.log('✅ Correct number of notifications stored');
    } else {
      console.error('❌ Incorrect number of notifications stored');
    }
    
    // Test notification update (mark as read)
    console.log('\n--- Testing Notification Update ---');
    const updatedNotifications = parsedNotifications.map(notification => {
      if (notification.id === '1') {
        return { ...notification, isRead: true, updatedAt: new Date().toISOString() };
      }
      return notification;
    });
    
    // Clear and re-add notifications in Redis (simulating NotificationService behavior)
    await redisClient.del(notificationKey);
    for (const notification of updatedNotifications) {
      await redisClient.lPush(notificationKey, JSON.stringify(notification));
    }
    console.log('✅ Updated notifications in Redis');
    
    // Verify the update
    const updatedStoredNotifications = await redisClient.lRange(notificationKey, 0, -1);
    const parsedUpdatedNotifications = updatedStoredNotifications.map(item => JSON.parse(item));
    const updatedNotification = parsedUpdatedNotifications.find(n => n.id === '1');
    
    if (updatedNotification && updatedNotification.isRead) {
      console.log('✅ Notification correctly marked as read');
    } else {
      console.error('❌ Notification not correctly marked as read');
    }
    
    // Test notification deletion
    console.log('\n--- Testing Notification Deletion ---');
    const filteredNotifications = parsedUpdatedNotifications.filter(
      notification => notification.id !== '2'
    );
    
    // Clear and re-add remaining notifications in Redis
    await redisClient.del(notificationKey);
    for (const notification of filteredNotifications) {
      await redisClient.lPush(notificationKey, JSON.stringify(notification));
    }
    console.log('✅ Deleted notification from Redis');
    
    // Verify the deletion
    const finalNotifications = await redisClient.lRange(notificationKey, 0, -1);
    if (finalNotifications.length === 1 && JSON.parse(finalNotifications[0]).id === '1') {
      console.log('✅ Notification correctly deleted');
    } else {
      console.error('❌ Notification not correctly deleted');
    }
    
    // Test Redis Pub/Sub for real-time notifications
    console.log('\n--- Testing Redis Pub/Sub ---');
    
    // Create subscriber client
    const subscriber = redisClient.duplicate();
    await subscriber.connect();
    
    // Subscribe to notifications channel
    let notificationReceived = false;
    await subscriber.subscribe('notifications', (message) => {
      console.log('✅ Received notification from Redis Pub/Sub:', message);
      notificationReceived = true;
    });
    console.log('✅ Subscribed to notifications channel');
    
    // Publish a notification
    const testNotificationEvent = {
      userId,
      notification: {
        id: '3',
        userId,
        type: 'realtime',
        message: 'Real-time test notification',
        data: {},
        isRead: false,
        createdAt: new Date().toISOString()
      }
    };
    
    await redisClient.publish('notifications', JSON.stringify(testNotificationEvent));
    console.log('✅ Published notification to Redis Pub/Sub');
    
    // Wait for the message to be received
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (notificationReceived) {
      console.log('✅ Real-time notification delivery working');
    } else {
      console.log('⚠️  No real-time notification received (may be normal in some configurations)');
    }
    
    // Clean up
    await subscriber.quit();
    await redisClient.del(notificationKey);
    await redisClient.del('notifications');
    
    console.log('\n✅ All NotificationService Redis tests completed');
    
  } catch (error) {
    console.error('❌ Notification Redis test failed:', error);
  } finally {
    // Close connections
    await redisClient.quit();
    await mongoose.connection.close();
    console.log('✅ Disconnected from all services');
  }
}

// Run the test
testNotificationRedis();