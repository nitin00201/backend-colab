# CI/CD Setup Guide

This document explains the CI/CD setup for the Monolith App backend without Docker.

## Overview

The CI/CD pipeline consists of two main workflows:

1. **CI (Continuous Integration)** - Runs on every push and pull request to main/develop branches
2. **Deploy** - Deploys to staging and production environments

## Workflows

### CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. **test** - Runs tests on Node.js 18.x and 20.x
   - Installs dependencies
   - Runs linting
   - Executes tests using your MongoDB Atlas and hosted Redis instances

2. **build** - Checks if the application builds correctly
   - Installs dependencies
   - Runs build script (if available)

### Deploy Workflow (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

**Jobs:**
1. **deploy-staging** - Deploys to staging environment
   - Runs tests
   - Deploys to staging (commands need to be customized)

2. **deploy-production** - Deploys to production environment
   - Runs tests
   - Deploys to production (commands need to be customized)

## Environment Variables

The following secrets need to be configured in your GitHub repository:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `REDIS_HOST` - Your hosted Redis instance hostname
- `REDIS_PORT` - Your hosted Redis instance port (usually 6379 or 6380)
- `REDIS_PASSWORD` - Your hosted Redis instance password (if required)
- Environment-specific secrets for staging and production deployments

To set up these secrets:
1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add your secrets:
   - MongoDB Atlas URI as `MONGODB_URI`
   - Redis host as `REDIS_HOST`
   - Redis port as `REDIS_PORT`
   - Redis password as `REDIS_PASSWORD` (if required)

## Hosted Services Setup

### MongoDB Atlas
Make sure your MongoDB Atlas instance is configured to accept connections from GitHub Actions IP addresses. You may need to:

1. Add GitHub Actions IP ranges to your Atlas IP whitelist
2. Use a strong password for your database user
3. Ensure your connection string includes the correct database name and authentication details

Example MongoDB Atlas URI format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/your-database-name?retryWrites=true&w=majority
```

### Hosted Redis Options
Here are some popular hosted Redis services with free tiers:

1. **Redis Cloud** (Redis Labs)
   - Free tier: 30MB shared instance
   - Easy setup and management
   - Good for development and testing

2. **Upstash**
   - Free tier: 10,000 commands per day
   - HTTP-based API (different from traditional Redis)
   - Good for serverless applications

3. **Aiven**
   - Free tier: 100MB instance
   - Supports multiple cloud providers
   - Includes backups and monitoring

4. **Render**
   - Free Redis instances available
   - Integrated with their deployment platform
   - Good if you're already using Render for hosting

To set up a hosted Redis instance:
1. Sign up for one of the services above
2. Create a new Redis instance
3. Note the hostname, port, and password (if required)
4. Add these details as GitHub secrets

## Customization

### Deployment Commands

The deployment jobs in `deploy.yml` currently have placeholder commands. You'll need to customize these based on your deployment target:

```yaml
# Example for deploying to a remote server via SSH
- name: Deploy to Staging
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.STAGING_HOST }}
    username: ${{ secrets.STAGING_USERNAME }}
    key: ${{ secrets.STAGING_SSH_KEY }}
    script: |
      cd /path/to/app
      git pull origin main
      npm ci
      pm2 restart your-app-name
```

### Environment Configuration

You can configure different environments in GitHub:

1. Go to Repository Settings
2. Click on "Environments"
3. Create "staging" and "production" environments
4. Add environment-specific secrets

## Running Locally

To test the CI pipeline locally, you can use [act](https://github.com/nektos/act):

```bash
# Run CI workflow
act push -W .github/workflows/ci.yml

# Run Deploy workflow
act push -W .github/workflows/deploy.yml
```