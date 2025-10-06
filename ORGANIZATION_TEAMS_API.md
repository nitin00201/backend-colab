# Organization and Teams API Documentation

This document provides detailed information about the Organization and Teams APIs available in the backend.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Organizations

### Create Organization
- **URL**: `/organizations`
- **Method**: `POST`
- **Description**: Create a new organization
- **Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```
- **Response**:
```json
{
  "organization": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": "string",
    "members": [],
    "teams": [],
    "projects": [],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### Get User's Organization
- **URL**: `/organizations/me`
- **Method**: `GET`
- **Description**: Get the organization the current user belongs to
- **Response**:
```json
{
  "organization": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "owner": {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    },
    "members": [
      {
        "user": {
          "_id": "string",
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "role": "string"
        },
        "role": "string",
        "joinedAt": "date"
      }
    ],
    "teams": [],
    "projects": [],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### Get Organization by ID
- **URL**: `/organizations/:id`
- **Method**: `GET`
- **Description**: Get a specific organization by ID
- **Response**:
```json
{
  "organization": {
    // Same structure as above
  }
}
```

### Update Organization
- **URL**: `/organizations/:id`
- **Method**: `PUT`
- **Description**: Update an organization (requires admin permissions or ownership)
- **Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```
- **Response**:
```json
{
  "organization": {
    // Updated organization object
  }
}
```

### Delete Organization
- **URL**: `/organizations/:id`
- **Method**: `DELETE`
- **Description**: Delete an organization (requires ownership)
- **Response**:
```json
{
  "message": "Organization deleted successfully"
}
```

### Get Organization Members
- **URL**: `/organizations/:id/members`
- **Method**: `GET`
- **Description**: Get all members of an organization
- **Response**:
```json
{
  "members": [
    {
      "user": {
        "_id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "role": "string"
      },
      "role": "string",
      "joinedAt": "date"
    }
  ]
}
```

### Add Member to Organization
- **URL**: `/organizations/:id/members`
- **Method**: `POST`
- **Description**: Add a member to the organization (requires admin permissions)
- **Request Body**:
```json
{
  "userId": "string",
  "role": "admin|manager|member"
}
```
- **Response**:
```json
{
  "organization": {
    // Updated organization object
  }
}
```

### Remove Member from Organization
- **URL**: `/organizations/:id/members`
- **Method**: `DELETE`
- **Description**: Remove a member from the organization (requires admin permissions)
- **Request Body**:
```json
{
  "userId": "string"
}
```
- **Response**:
```json
{
  "organization": {
    // Updated organization object
  }
}
```

### Update Member Role
- **URL**: `/organizations/:id/members/role`
- **Method**: `PUT`
- **Description**: Update a member's role in the organization (requires admin permissions)
- **Request Body**:
```json
{
  "userId": "string",
  "role": "admin|manager|member"
}
```
- **Response**:
```json
{
  "organization": {
    // Updated organization object
  }
}
```

## Teams

### Create Team
- **URL**: `/teams`
- **Method**: `POST`
- **Description**: Create a new team within the user's organization
- **Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```
- **Response**:
```json
{
  "team": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "organization": "string",
    "members": [
      {
        "user": {
          "_id": "string",
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "role": "string"
        },
        "role": "lead|member",
        "joinedAt": "date"
      }
    ],
    "projects": [],
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### Get All Teams in Organization
- **URL**: `/teams`
- **Method**: `GET`
- **Description**: Get all teams in the user's organization
- **Response**:
```json
{
  "teams": [
    {
      // Team objects
    }
  ]
}
```

### Get Team by ID
- **URL**: `/teams/:id`
- **Method**: `GET`
- **Description**: Get a specific team by ID
- **Response**:
```json
{
  "team": {
    // Team object
  }
}
```

### Update Team
- **URL**: `/teams/:id`
- **Method**: `PUT`
- **Description**: Update a team (requires team lead permissions)
- **Request Body**:
```json
{
  "name": "string",
  "description": "string"
}
```
- **Response**:
```json
{
  "team": {
    // Updated team object
  }
}
```

### Delete Team
- **URL**: `/teams/:id`
- **Method**: `DELETE`
- **Description**: Delete a team (requires team lead permissions)
- **Response**:
```json
{
  "message": "Team deleted successfully"
}
```

### Get Team Members
- **URL**: `/teams/:id/members`
- **Method**: `GET`
- **Description**: Get all members of a team
- **Response**:
```json
{
  "members": [
    {
      "user": {
        "_id": "string",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "role": "string"
      },
      "role": "lead|member",
      "joinedAt": "date"
    }
  ]
}
```

### Add Member to Team
- **URL**: `/teams/:id/members`
- **Method**: `POST`
- **Description**: Add a member to the team (requires team lead permissions)
- **Request Body**:
```json
{
  "userId": "string",
  "role": "lead|member"
}
```
- **Response**:
```json
{
  "team": {
    // Updated team object
  }
}
```

### Remove Member from Team
- **URL**: `/teams/:id/members`
- **Method**: `DELETE`
- **Description**: Remove a member from the team (requires team lead permissions)
- **Request Body**:
```json
{
  "userId": "string"
}
```
- **Response**:
```json
{
  "team": {
    // Updated team object
  }
}
```

### Update Member Role in Team
- **URL**: `/teams/:id/members/role`
- **Method**: `PUT`
- **Description**: Update a member's role in the team (requires team lead permissions)
- **Request Body**:
```json
{
  "userId": "string",
  "role": "lead|member"
}
```
- **Response**:
```json
{
  "team": {
    // Updated team object
  }
}
```

## Error Responses
All endpoints may return the following error responses:

- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

Example error response:
```json
{
  "error": "Error message"
}
```