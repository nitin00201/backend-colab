// Environment configuration
const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://root:password@localhost:27018/monolith?authSource=admin',
    user: process.env.MONGO_USER || '',
    password: process.env.MONGO_PASSWORD || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  app: {
    name: process.env.APP_NAME || 'MonolithApp',
    url: process.env.APP_URL || 'http://localhost:3000',
  },
};

export default config;