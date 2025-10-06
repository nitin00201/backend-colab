# Organization and Teams API Implementation

This document explains the implementation of the Organization and Teams APIs in the backend and how to use them in the frontend.

## Overview

The backend already had a comprehensive implementation of Organization and Teams APIs. I've added two additional endpoints to make the API more complete for frontend integration:

1. `GET /api/v1/organizations/:id/members` - Get all members of an organization
2. `GET /api/v1/teams/:id/members` - Get all members of a team

## Backend Implementation

### Files Modified

1. `src/controllers/OrganizationController.js` - Added `getOrganizationMembers` method
2. `src/controllers/TeamController.js` - Added `getTeamMembersById` method
3. `src/routes/organizations.js` - Added route for getting organization members
4. `src/routes/teams.js` - Added route for getting team members
5. `ORGANIZATION_TEAMS_API.md` - Updated API documentation

### New Endpoints

#### Get Organization Members
- **URL**: `GET /api/v1/organizations/:id/members`
- **Description**: Returns all members of a specific organization
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
      "role": "admin|manager|member",
      "joinedAt": "date"
    }
  ]
}
```

#### Get Team Members
- **URL**: `GET /api/v1/teams/:id/members`
- **Description**: Returns all members of a specific team
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

## Frontend Integration

### API Utility Functions

Located at: `front/monolith-app/src/lib/organizationTeamsApi.js`

This file provides utility functions for all Organization and Teams API endpoints:

```javascript
import organizationTeamsApi from '../lib/organizationTeamsApi';

// Example usage:
const fetchOrganization = async () => {
  try {
    const response = await organizationTeamsApi.getUserOrganization();
    console.log(response.organization);
  } catch (error) {
    console.error('Error fetching organization:', error);
  }
};

const createNewTeam = async (teamData) => {
  try {
    const response = await organizationTeamsApi.createTeam(teamData);
    console.log('Team created:', response.team);
  } catch (error) {
    console.error('Error creating team:', error);
  }
};
```

### Example Component

Located at: `front/monolith-app/src/components/organization/OrganizationTeamsExample.js`

This React component demonstrates how to use the API utility functions to display organization and team information.

## Testing

### API Documentation

See `ORGANIZATION_TEAMS_API.md` for complete API documentation.

### Test Script

A test script is available at `test-organization-teams.js` that demonstrates how to use the APIs programmatically.

## Usage Instructions

1. Make sure the backend server is running (`npm start` in the backend directory)
2. Ensure you have a valid JWT token for authentication
3. Use the utility functions in `organizationTeamsApi.js` to interact with the APIs
4. Refer to `OrganizationTeamsExample.js` for implementation examples

## Authentication

All endpoints require authentication. The utility functions automatically use the token stored in localStorage under the key 'authToken'.

To set the auth token:
```javascript
organizationTeamsApi.setAuthToken('your-jwt-token');
```

To check if authenticated:
```javascript
if (organizationTeamsApi.isAuthenticated()) {
  // User is authenticated
}
```