# Render Deployment Guide

This guide explains how to deploy the Monolith App to Render.

## Prerequisites

1. A Render account (https://render.com)
2. A MongoDB database (you can use MongoDB Atlas)
3. A Redis instance (you can use Upstash Redis on Render)

## Deployment Steps

### 1. Create Services on Render

#### Web Service
1. Go to your Render dashboard
2. Click "New+" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - **Name**: monolith-app
   - **Environment**: Node
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or choose based on your needs)

#### Redis Service (Optional but Recommended)
1. Click "New+" and select "Redis"
2. Choose "Upstash Redis"
3. Select the free tier or paid based on your needs

#### MongoDB Service (Optional)
If you don't want to use MongoDB Atlas, you can deploy MongoDB on Render:
1. Click "New+" and select "Private Service"
2. Use the following Docker image: `mongo:6-jammy`
3. Set environment variables:
   - `MONGO_INITDB_ROOT_USERNAME`: your_username
   - `MONGO_INITDB_ROOT_PASSWORD`: your_password
4. Add a persistent disk for data storage

### 2. Environment Variables

Set the following environment variables in your Render web service:

```bash
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
JWT_ACCESS_SECRET=your_random_access_secret
JWT_REFRESH_SECRET=your_random_refresh_secret
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### 3. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. The deployment process may take a few minutes

## Troubleshooting

### Common Issues

1. **Buildkit Connectivity Error**: This is a Render-specific issue. Make sure your Dockerfile is using the correct syntax and doesn't require buildkit features.

2. **CORS Issues**: In production, the application allows all origins. If you want to restrict this, modify the CORS configuration in `src/server.js`.

3. **Database Connection Issues**: Ensure your MongoDB URI is correct and the database is accessible from Render.

4. **Port Issues**: The application uses the PORT environment variable provided by Render. Make sure your code respects this.

### Health Check

Once deployed, you can check if your application is running by visiting:
`https://your-app-name.onrender.com/health`

## Scaling

For production use, consider:
1. Upgrading from the free tier to a paid plan for better performance
2. Adding a custom domain
3. Setting up automatic deploys from your GitHub repository
4. Configuring environment-specific settings for staging and production

## Monitoring

Render provides built-in logging and monitoring. You can view logs in the Render dashboard under your service's "Logs" tab.