# Postman Collection for Monolith App API

This directory contains the Postman collection and environment files for testing the Monolith App API.

## Files

1. `Monolith-App-API.postman_collection.json` - The main Postman collection with all API endpoints
2. `Monolith-App-Environment.postman_environment.json` - Environment variables for the collection

## How to Import into Postman

1. Open Postman
2. Click on "Import" in the top left corner
3. Select the `Monolith-App-API.postman_collection.json` file
4. Click on "Import" again
5. Click on "Import" in the top left corner
6. Select the `Monolith-App-Environment.postman_environment.json` file
7. Click on "Import" again

## Environment Variables

The environment includes the following variables:

- `base_url`: The base URL of the API (default: http://localhost:3000)
- `access_token`: JWT access token for authentication
- `refresh_token`: JWT refresh token
- `user_id`: User ID for user-related operations
- `project_id`: Project ID for project-related operations
- `task_id`: Task ID for task-related operations
- `document_id`: Document ID for document-related operations
- `notification_id`: Notification ID for notification-related operations
- `room_id`: Room ID for chat-related operations

## Usage Instructions

1. Start the Monolith App server
2. Import the collection and environment files into Postman
3. Select the "Monolith App Environment" from the environment dropdown
4. Run the "Register User" and "Login User" requests to get authentication tokens
5. Copy the access token from the login response and paste it into the `access_token` environment variable
6. Use the other requests to test the API endpoints

## Authentication

Most requests require authentication. The access token should be included in the Authorization header as a Bearer token:

```
Authorization: Bearer {{access_token}}
```

## ID Variables

To use requests that require specific IDs (user_id, project_id, etc.), you'll need to:

1. Create the resource using the appropriate request
2. Copy the ID from the response
3. Paste it into the corresponding environment variable

For example, after creating a project, copy the project ID from the response and paste it into the `project_id` environment variable.

## Testing Workflow

1. Authentication
   - Register a new user
   - Login to get access and refresh tokens
   - Set the access token in the environment

2. Project Management
   - Create a project
   - Set the project ID in the environment
   - Add members to the project

3. Task Management
   - Create tasks in the project
   - Update task status
   - Assign tasks to users

4. Document Collaboration
   - Create documents in the project
   - Update document content
   - View document versions

5. Notifications
   - Create notifications
   - View notifications
   - Mark notifications as read

6. Chat
   - Create chat rooms
   - Send messages
   - View chat history

## Notes

- The collection is organized by resource type (Authentication, Users, Projects, Tasks, etc.)
- Each request includes example data in the body where applicable
- Responses are not pre-defined, but you can add tests to validate responses
- The base URL can be changed to test against different environments (development, staging, production)