// WebSocketService.js
import { Server } from 'socket.io';
import { createClient } from 'redis';
import logger from '../utils/logger.js';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import Notification from '../models/Notification.js';

let websocketService = null;
let broadcastFunction = null;

// Method to broadcast to all users
export const broadcast = (event, data) => {
  if (broadcastFunction) {
    broadcastFunction(event, data);
  } else {
    logger.warn('WebSocket service not initialized yet');
  }
};

export const initializeWebSocketService = (httpServer) => {
  if (websocketService) return websocketService;

  // CORS configuration for Socket.IO
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // List of allowed origins
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://your-production-domain.com' // Add your production domain here
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  };

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: corsOptions
  });

  // Redis setup
  let redisClient = null;
  let redisSubscriber = null;
  let redisEnabled = false;

  if (process.env.REDIS_HOST) {
    try {
      redisClient = createClient({
        url: `redis://redis-11031.c11.us-east-1-3.ec2.redns.redis-cloud.com:11031`,
        password: process.env.REDIS_PASSWORD || undefined,
        username: process.env.REDIS_USERNAME || 'default',
      });

      redisSubscriber = redisClient.duplicate();
      redisEnabled = true;
      logger.info('Redis configured for WebSocket service');
    } catch (err) {
      logger.error('Failed to create Redis client:', err);
      redisEnabled = false;
    }
  } else {
    logger.info('Redis not configured, running WebSocket in single instance mode');
  }

  // Publish event to Redis
  const publishEvent = async (eventType, data) => {
    if (!redisEnabled) return;

    const event = { type: eventType, data, timestamp: new Date() };

    try {
      if (!redisClient.isOpen) await redisClient.connect();
      await redisClient.publish('websocket-events', JSON.stringify(event));
    } catch (err) {
      logger.error('Error publishing to Redis:', err);
    }
  };

  // Handle Redis events
  const handleRedisEvent = (event) => {
    const { type, data } = event;

    switch (type) {
      case 'userJoined':
        io.to(data.roomId).emit('userJoined', data);
        break;
      case 'message':
        io.to(data.roomId).emit('message', data);
        break;
      case 'documentUpdate':
        io.to(`document-${data.documentId}`).emit('documentUpdate', data);
        break;
      case 'taskUpdated':
        io.to(`project-${data.projectId}`).emit('taskUpdated', data);
        break;
      case 'userDisconnected':
        break;
      case 'typing':
        io.to(data.roomId).emit('typing', data);
        break;
      case 'notification':
        // Send notification to specific user
        io.to(`user-${data.userId}`).emit('notification', data.notification);
        break;
    }
  };

  // Setup Redis Pub/Sub
  const setupRedisPubSub = async () => {
    if (!redisEnabled) return;
    try {
      if (!redisSubscriber.isOpen) await redisSubscriber.connect();

      await redisSubscriber.subscribe('websocket-events', (message) => {
        try {
          const event = JSON.parse(message);
          handleRedisEvent(event);
        } catch (err) {
          logger.error('Error parsing Redis message:', err);
        }
      });

      logger.info('Redis Pub/Sub initialized for WebSocket service');
    } catch (err) {
      logger.error('Error setting up Redis Pub/Sub:', err);
      redisEnabled = false;
    }
  };

  // Socket.IO event listeners
  const setupEventListeners = () => {
    io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Join a chat room
      socket.on('join', async ({ userId, roomId }) => {
        try {
          logger.info('User joining chat room', { userId, roomId, socketId: socket.id });
          socket.userId = userId;
          socket.join(roomId);
          
          // Notify others in the room
          socket.to(roomId).emit('userJoined', { userId, roomId });
          logger.info('User joined chat room', { userId, roomId, socketId: socket.id });
          
          if (redisEnabled) publishEvent('userJoined', { userId, roomId });
        } catch (error) {
          logger.error('Error joining room:', error);
        }
      });

      // Join user's personal notification room
      socket.on('joinNotifications', async ({ userId }) => {
        try {
          logger.info('User joining notification room', { userId, socketId: socket.id });
          socket.userId = userId;
          socket.join(`user-${userId}`);
          
          // Also join a general room for broadcast notifications
          socket.join('notifications');
          
          logger.info('User joined notification room', { userId, socketId: socket.id });
        } catch (error) {
          logger.error('Error joining notification room:', error);
        }
      });

      // Send a chat message
      socket.on('message', async ({ roomId, message, userId, userName, to }) => {
        try {
          logger.info('Received message via WebSocket', { roomId, userId, messageLength: message.length });
          
          // Verify user has access to chat room
          const chatRoom = await Chat.findOne({ 
            _id: roomId, 
            participants: userId 
          });

          if (!chatRoom) {
            logger.warn('User attempted to send message to unauthorized chat room', { userId, roomId });
            return;
          }

          // Save message to database
          const messageData = {
            chat: roomId,
            sender: userId,
            content: message,
            to: to || undefined,
            timestamp: new Date()
          };

          const newMessage = new Message(messageData);
          await newMessage.save();
          
          // Populate sender info
          await newMessage.populate('sender', 'firstName lastName email');
          
          // Update chat's updatedAt timestamp
          await Chat.findByIdAndUpdate(roomId, { updatedAt: new Date() });
          
          // Prepare message data for clients
          const messagePayload = {
            _id: newMessage._id,
            chat: newMessage.chat,
            sender: {
              _id: newMessage.sender._id,
              firstName: newMessage.sender.firstName,
              lastName: newMessage.sender.lastName,
              email: newMessage.sender.email
            },
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            readBy: newMessage.readBy || [],
            attachments: newMessage.attachments || []
          };

          // Emit to all OTHER users in the room (not back to sender)
          socket.to(roomId).emit('message', messagePayload);
          logger.info('Message broadcast to room', { roomId, messageId: newMessage._id, recipientCount: socket.adapter.rooms.get(roomId)?.size - 1 });
          
          // Publish to Redis if enabled
          if (redisEnabled) publishEvent('message', messagePayload);
          
          logger.info('Message sent to chat room', { roomId, userId, messageId: newMessage._id });
        } catch (error) {
          logger.error('Error sending message:', error);
        }
      });

      // Typing indicator
      socket.on('typing', ({ roomId, userId, userName, isTyping }) => {
        logger.info('Typing indicator received', { roomId, userId, isTyping });
        const typingData = { userId, userName, roomId, isTyping };
        socket.to(roomId).emit('typing', typingData);
        if (redisEnabled) publishEvent('typing', typingData);
      });

      // Document editing
      socket.on('documentEdit', ({ documentId, content, userId }) => {
        socket.to(`document-${documentId}`).emit('documentUpdate', { documentId, content, userId, timestamp: new Date() });
        if (redisEnabled) publishEvent('documentUpdate', { documentId, content, userId });
      });

      // Task updates
      socket.on('taskUpdate', ({ projectId, task, userId }) => {
        socket.to(`project-${projectId}`).emit('taskUpdated', { task, userId, timestamp: new Date() });
        if (redisEnabled) publishEvent('taskUpdated', { projectId, task, userId });
      });

      // Send notification to user
      socket.on('sendNotification', async ({ userId, notification }) => {
        try {
          logger.info('Sending notification via WebSocket', { userId, notification });
          
          // Save notification to database
          const notificationDoc = new Notification({
            userId,
            ...notification
          });
          await notificationDoc.save();
          
          // Emit to user's notification room
          io.to(`user-${userId}`).emit('notification', {
            id: notificationDoc._id.toString(),
            userId: notificationDoc.userId.toString(),
            type: notificationDoc.type,
            title: notificationDoc.title,
            message: notificationDoc.message,
            data: notificationDoc.data,
            isRead: notificationDoc.isRead,
            link: notificationDoc.link,
            createdAt: notificationDoc.createdAt.toISOString(),
            updatedAt: notificationDoc.updatedAt.toISOString()
          });
          
          // Publish to Redis if enabled
          if (redisEnabled) {
            publishEvent('notification', {
              userId,
              notification: {
                id: notificationDoc._id.toString(),
                userId: notificationDoc.userId.toString(),
                type: notificationDoc.type,
                title: notificationDoc.title,
                message: notificationDoc.message,
                data: notificationDoc.data,
                isRead: notificationDoc.isRead,
                link: notificationDoc.link,
                createdAt: notificationDoc.createdAt.toISOString(),
                updatedAt: notificationDoc.updatedAt.toISOString()
              }
            });
          }
          
          logger.info('Notification sent to user', { userId, notificationId: notificationDoc._id });
        } catch (error) {
          logger.error('Error sending notification:', error);
        }
      });

      // User disconnects
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
        if (redisEnabled) publishEvent('userDisconnected', { userId: socket.userId });
      });
    });
  };

  // Send notification to a specific user
  const sendNotification = (userId, notification) => {
    io.to(`user-${userId}`).emit('notification', notification);
    if (redisEnabled) publishEvent('notification', { userId, notification });
  };

  // Broadcast to all users
  const internalBroadcast = (event, data) => {
    io.emit(event, data);
    if (redisEnabled) publishEvent(event, data);
  };

  // Initialize the WebSocket service
  const initialize = async () => {
    try {
      if (redisEnabled) {
        if (!redisClient.isOpen) await redisClient.connect();
        await setupRedisPubSub();
      }

      setupEventListeners();
      logger.info('WebSocket service initialized');
    } catch (err) {
      logger.error('Failed to initialize WebSocket service:', err);
    }
  };

  websocketService = { initialize, sendNotification, broadcast: internalBroadcast };
  broadcastFunction = internalBroadcast;

  return websocketService;
};