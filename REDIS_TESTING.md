# Redis Testing Guide

This document explains how to test the Redis client in your Monolith App.

## Overview

The application uses Redis for:
1. Caching user notifications
2. Real-time messaging through Pub/Sub
3. Session storage (if implemented)
4. Background job queues (with Inngest)

## Test Scripts

### 1. Basic Redis Connection Test (`test-redis-connection.js`)

This script tests basic Redis connectivity and operations:

```bash
node test-redis-connection.js
```

It verifies:
- Connection to Redis server
- Basic SET/GET operations
- List operations (LPUSH/LRANGE)
- Pub/Sub functionality
- Redis server information

### 2. Notification Service Redis Test (`test-notification-redis.js`)

This script tests Redis operations specific to the notification system:

```bash
node test-notification-redis.js
```

It verifies:
- Notification storage in Redis lists
- Notification updates (mark as read)
- Notification deletion
- Real-time notification delivery via Pub/Sub

### 3. Notification Service Integration Test (`test-notification-service.js`)

This script tests the NotificationService with MongoDB (bypassing Redis issues):

```bash
node test-notification-service.js
```

It verifies:
- Notification creation in MongoDB
- Notification retrieval
- Marking notifications as read
- Deleting notifications

## Redis Configuration

The application uses the following environment variables for Redis configuration:

- `REDIS_HOST` - Redis server hostname
- `REDIS_PORT` - Redis server port (default: 6379)
- `REDIS_PASSWORD` - Redis password (if required)
- `REDIS_USERNAME` - Redis username (default: 'default')

These are configured in:
- `.env` file (for local development)
- GitHub Actions secrets (for CI/CD)
- Production environment variables (for deployment)

## Testing Redis in Different Environments

### Local Development

1. Ensure Redis is running locally or use a hosted Redis service
2. Configure `.env` with appropriate Redis settings
3. Run test scripts to verify connectivity

### CI/CD Environment

1. Configure GitHub secrets for Redis connection
2. The CI workflow uses hosted Redis services
3. Tests run automatically on push/PR

### Production Environment

1. Use a production-grade Redis service
2. Configure environment variables in your deployment platform
3. Monitor Redis performance and connection metrics

## Troubleshooting

### Common Issues

1. **Authentication Errors**: 
   - Verify `REDIS_PASSWORD` is correctly set
   - Check if `REDIS_USERNAME` is required by your Redis provider

2. **Connection Timeouts**:
   - Verify `REDIS_HOST` and `REDIS_PORT` are correct
   - Check firewall settings for hosted Redis services
   - Ensure your Redis provider allows connections from your IP/environment

3. **Operation Errors**:
   - Check Redis server logs for specific error messages
   - Verify Redis version compatibility

### Debugging Steps

1. **Verify Environment Variables**:
   ```bash
   # Check if environment variables are set
   echo $REDIS_HOST
   echo $REDIS_PORT
   ```

2. **Test Connectivity Manually**:
   ```bash
   # If you have redis-cli installed
   redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
   ```

3. **Check Redis Server Info**:
   The `test-redis-connection.js` script includes Redis server information.

## Redis Usage in Services

### NotificationService

- Stores notifications in Redis lists with key pattern: `notifications:${userId}`
- Uses Redis Pub/Sub to broadcast real-time notifications
- Falls back to MongoDB if Redis operations fail

### WebSocketService

- Uses Redis Pub/Sub for distributed WebSocket messaging
- Publishes events to `websocket-events` channel
- Subscribes to events for real-time message distribution

## Best Practices

1. **Always Handle Redis Failures Gracefully**:
   - Implement fallback mechanisms (e.g., MongoDB storage)
   - Log Redis errors without failing the entire operation

2. **Use Connection Pooling**:
   - Reuse Redis connections when possible
   - Properly close connections to prevent leaks

3. **Monitor Redis Performance**:
   - Track connection counts
   - Monitor memory usage
   - Watch for slow operations

4. **Secure Redis Connections**:
   - Always use passwords for production Redis instances
   - Restrict Redis access to specific IP addresses
   - Use SSL/TLS when supported by your Redis provider