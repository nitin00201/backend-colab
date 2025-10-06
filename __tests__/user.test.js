import mongoose from 'mongoose';
import User from '../src/models/User.js';
import redis from 'redis';
import { promisify } from 'util';

describe('User Model', () => {
  let redisClient;
  let getAsync;
  let setAsync;

  beforeAll(async () => {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/monolith';
    await mongoose.connect(mongoUri);

    // Connect to Redis if configured
    if (process.env.REDIS_HOST) {
      redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

      getAsync = promisify(redisClient.get).bind(redisClient);
      setAsync = promisify(redisClient.set).bind(redisClient);

      redisClient.on('error', (err) => {
        console.error('Redis error:', err);
      });

      await new Promise((resolve, reject) => {
        redisClient.once('connect', resolve);
        redisClient.once('error', reject);
      });
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
    
    if (redisClient) {
      await redisClient.quit();
    }
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.role).toBe('member');
    expect(savedUser.isActive).toBe(true);
  });

  it('should not create a user with duplicate email', async () => {
    const userData = {
      email: 'duplicate@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    // Create first user
    const user1 = new User(userData);
    await user1.save();

    // Try to create second user with same email
    const user2 = new User(userData);
    
    await expect(user2.save()).rejects.toThrow();
  });

  it('should hash the password before saving', async () => {
    const userData = {
      email: 'hash@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.password).not.toBe(userData.password);
    const isMatch = await savedUser.comparePassword(userData.password);
    expect(isMatch).toBe(true);
  });

  it('should work with Redis caching', async () => {
    // Skip this test if Redis is not configured
    if (!redisClient) {
      console.log('Redis not configured, skipping Redis test');
      return;
    }

    const key = 'test-key';
    const value = 'test-value';

    // Set a value in Redis
    await setAsync(key, value);

    // Get the value from Redis
    const result = await getAsync(key);

    expect(result).toBe(value);
  });
});