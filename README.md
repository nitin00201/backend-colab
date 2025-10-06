# Monolith Application

A production-level Node.js monolithic application with JWT authentication, role-based access control, MongoDB, Redis, and Render deployment support.

## Features

- JWT Authentication (Access + Refresh tokens)
- Role-based access control (Admin, Manager, Member)
- User management (CRUD operations)
- MongoDB for data storage
- Redis for caching and pub/sub
- Environment-based configuration
- Security best practices (Helmet, CORS, Rate limiting)
- Real-time capabilities with WebSocket
- Notification system with in-app and email notifications
- Background job processing with Inngest
- Task management with Kanban-style boards
- Document collaboration with version history
- Event-driven workflows with Inngest
- Email notifications with Nodemailer
- Organization and Team management

## Prerequisites

- Node.js 16+
- MongoDB Atlas account (or local MongoDB)
- Redis instance (hosted or local)

## Getting Started

### Using Render (Recommended)

1. Clone the repository
2. Follow the [Render Deployment Guide](RENDER_DEPLOYMENT.md) for detailed instructions

### Local Development (Using MongoDB Atlas and Hosted Redis)

1. Clone the repository
2. Run `npm install`
3. Set up MongoDB Atlas and configure environment variables in `.env`
4. Set up a hosted Redis service and configure environment variables in `.env`
5. Run `npm start`

## Redis Testing

This application includes comprehensive Redis testing capabilities:

- **Basic Redis Connection Test**: Verifies connectivity and basic operations
- **Notification Service Redis Test**: Tests Redis operations specific to notifications
- **Integration Tests**: Tests NotificationService with MongoDB

For detailed information about Redis testing, see [REDIS_TESTING.md](REDIS_TESTING.md).

## CI/CD Setup

This project includes GitHub Actions workflows for Continuous Integration and Deployment without Docker:

- **CI Pipeline**: Runs tests on every push/PR using your MongoDB Atlas and hosted Redis instances
- **Deploy Pipeline**: Deploys to staging and production environments

For detailed information about the CI/CD setup, see [CI_CD_SETUP.md](CI_CD_SETUP.md).

## API Endpoints

### Authentication

- `POST /api/v1/register` - Register a new user
- `POST /api/v1/login` - Login user
- `POST /api/v1/refresh-token` - Refresh access token
- `GET /api/v1/profile` - Get current user profile

### User Management

- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user profile
- `DELETE /api/v1/users/:id` - Delete user (Admin only)
- `PUT /api/v1/users/:id/role` - Update user role (Admin only)

### Organizations

- `POST /api/v1/organizations` - Create a new organization
- `GET /api/v1/organizations/me` - Get current user's organization
- `GET /api/v1/organizations/:id` - Get organization by ID
- `PUT /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization
- `GET /api/v1/organizations/:id/members` - Get organization members
- `POST /api/v1/organizations/:id/members` - Add member to organization
- `DELETE /api/v1/organizations/:id/members` - Remove member from organization
- `PUT /api/v1/organizations/:id/members/role` - Update member role

### Teams

- `POST /api/v1/teams` - Create a new team
- `GET /api/v1/teams` - Get all teams for current user's organization
- `GET /api/v1/teams/:id` - Get team by ID
- `PUT /api/v1/teams/:id` - Update team
- `DELETE /api/v1/teams/:id` - Delete team
- `GET /api/v1/teams/:id/members` - Get team members
- `POST /api/v1/teams/:id/members` - Add member to team
- `DELETE /api/v1/teams/:id/members` - Remove member from team
- `PUT /api/v1/teams/:id/members/role` - Update member role

### Projects

- `POST /api/v1/projects` - Create a new project
- `GET /api/v1/projects` - Get all projects for current user
- `GET /api/v1/projects/:projectId` - Get project by ID
- `PUT /api/v1/projects/:projectId` - Update project
- `DELETE /api/v1/projects/:projectId` - Delete project
- `POST /api/v1/projects/:projectId/members` - Add member to project
- `DELETE /api/v1/projects/:projectId/members/:userId` - Remove member from project

### Tasks

- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/project/:projectId` - Get all tasks for a project
- `GET /api/v1/tasks/user` - Get tasks assigned to current user
- `GET /api/v1/tasks/:taskId` - Get task by ID
- `PUT /api/v1/tasks/:taskId` - Update task
- `DELETE /api/v1/tasks/:taskId` - Delete task

### Documents

- `POST /api/v1/documents` - Create a new document
- `GET /api/v1/documents/project/:projectId` - Get all documents for a project
- `GET /api/v1/documents/:documentId` - Get document by ID
- `PUT /api/v1/documents/:documentId` - Update document
- `PUT /api/v1/documents/:documentId/content` - Update document content (real-time)
- `DELETE /api/v1/documents/:documentId` - Delete document
- `GET /api/v1/documents/:documentId/versions` - Get document versions
- `POST /api/v1/documents/:documentId/restore` - Restore document to a specific version

### Notifications

- `GET /api/v1/notifications` - Get user notifications
- `POST /api/v1/notifications` - Create a notification
- `PUT /api/v1/notifications/:notificationId/read` - Mark notification as read
- `DELETE /api/v1/notifications/:notificationId` - Delete notification

### Chat

- `POST /api/v1/chat/rooms` - Create a chat room
- `GET /api/v1/chat/rooms` - Get all chat rooms
- `GET /api/v1/chat/rooms/:roomId/messages` - Get chat history for a room

### Inngest

- `POST /api/v1/inngest` - Inngest function endpoint

## WebSocket Testing

This repository includes several tools for testing WebSocket functionality:

### Browser-based Testing
- `/websocket-chat-test` - Interactive chat testing interface
- `/document-collaboration-test` - Document collaboration testing interface
- `/task-document-demo` - Task management and document collaboration demo
- `/inngest-resend-demo` - Event-driven workflows demo

### Node.js Testing Scripts
- `test-websocket-chat.js` - Automated chat functionality tests
- `test-document-collaboration.js` - Automated document collaboration tests

To use the browser-based testing tools:
1. Start the server with `npm start`
2. Navigate to `http://localhost:3000/websocket-chat-test` or other test URLs

To run the Node.js testing scripts:
```bash
node test-websocket-chat.js
node test-document-collaboration.js
```

## Postman Collection

This repository includes a comprehensive Postman collection for testing the API:

- `Monolith-App-API.postman_collection.json` - Complete API collection with all endpoints
- `Monolith-App-Environment.postman_environment.json` - Environment variables for the collection
- `POSTMAN.md` - Documentation for using the Postman collection

To use the Postman collection:

1. Import both JSON files into Postman
2. Select the "Monolith App Environment" 
3. Start testing the API endpoints

## Organization and Teams API

This application includes comprehensive Organization and Teams management APIs. For detailed documentation, see:

- [Organization and Teams API Documentation](ORGANIZATION_TEAMS_API.md)

## Deployment

For deployment instructions, see:

- [Render Deployment Guide](RENDER_DEPLOYMENT.md)