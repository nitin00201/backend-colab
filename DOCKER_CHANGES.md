# Docker Configuration Changes

This document summarizes the changes made to the Docker configuration to map MongoDB to port 27018 instead of 27017 to avoid conflicts with local MongoDB instances.

## Files Modified

### 1. docker-compose.yml (Base Configuration)
- Changed MongoDB port mapping from `27017:27017` to `27018:27017`
- Updated MONGODB_URI to include authentication: `mongodb://root:password@mongo:27017/monolith?authSource=admin`

### 2. src/config/index.js
- Updated default MongoDB URI to use port 27018 with authentication: `mongodb://root:password@localhost:27018/monolith?authSource=admin`

### 3. .env.example
- Updated MONGODB_URI to use port 27018 with authentication: `mongodb://root:password@127.0.0.1:27018/monolith?authSource=admin`

## New Files Created

### 1. docker-compose.dev.yml (Development Configuration)
- MongoDB mapped to port 27018
- Development environment variables
- Volume mapping for src directory for hot reloading

### 2. docker-compose.prod.yml (Production Configuration)
- MongoDB mapped to port 27018
- Production environment variables
- Production-specific settings (e.g., stronger passwords)

## Usage Instructions

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Default
```bash
docker-compose up -d
```

## Port Configuration Summary

- Local MongoDB (if running): 27017
- Docker MongoDB: 27018 (mapped to container port 27017)
- Redis: 6379
- Application: 3000

This configuration ensures no port conflicts with local MongoDB instances while maintaining proper authentication and environment-specific settings.