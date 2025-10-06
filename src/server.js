import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import { createServer } from 'http';
import { initializeWebSocketService } from './services/WebSocketService.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if we're in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // In production, allow all origins (you can restrict this to your domain)
    if (isProduction) {
      callback(null, true);
    } else {
      // List of allowed origins for development
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://frontend-colab.vercel.app' // Add your production domain here
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monolith')
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// API Routes
import apiRoutes from './routes/api.js';
app.use('/api/v1', apiRoutes);

// Routes for demos/tests
const demoRoutes = [
  ['/', 'index.html'],
  ['/task-document-demo', 'task-document-demo.html'],
  ['/inngest-resend-demo', 'inngest-resend-demo.html'],
  ['/websocket-chat-test', 'websocket-chat-test.html'],
  ['/document-collaboration-test', 'document-collaboration-test.html']
];

demoRoutes.forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../public', file));
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize WebSocket service
const websocketService = initializeWebSocketService(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Initialize WebSocket service after server starts listening
  (async () => {
    try {
      await websocketService.initialize();
      logger.info('WebSocket service initialized');
    } catch (err) {
      logger.error('Failed to initialize WebSocket service:', err);
    }
  })();
});

export default app;