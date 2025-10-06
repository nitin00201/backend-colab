// Example script demonstrating how to use the invitation-only feature
// This shows how to invite users by email without adding them to teams/organizations

import axios from 'axios';

// Example: Inviting a user to a team (user doesn't exist in system)
async function inviteUserToTeam() {
  try {
    // Assuming you have a valid auth token
    const authToken = 'your-auth-token-here';
    
    // Team ID (obtained from creating a team or fetching existing teams)
    const teamId = 'team-id-here';
    
    // Invite a user who doesn't exist in the system
    const response = await axios.post(
      `http://localhost:3000/api/v1/teams/${teamId}/members`,
      {
        email: 'newuser@example.com',  // Email of user to invite
        role: 'member'                 // Role they'll have when they join
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Invitation response:', response.data);
    
    // Expected response when user doesn't exist:
    // {
    //   "message": "Invitation sent successfully",
    //   "invited": true,
    //   "email": "newuser@example.com"
    // }
    
    // Expected response when user exists:
    // {
    //   "team": { /* updated team object with new member */ },
    //   "message": "Member added successfully"
    // }
    
  } catch (error) {
    console.error('Error inviting user to team:', error.response?.data || error.message);
  }
}

// Example: Inviting a user to an organization (user doesn't exist in system)
async function inviteUserToOrganization() {
  try {
    // Assuming you have a valid auth token
    const authToken = 'your-auth-token-here';
    
    // Organization ID (obtained from fetching user's organization)
    const organizationId = 'organization-id-here';
    
    // Invite a user who doesn't exist in the system
    const response = await axios.post(
      `http://localhost:3000/api/v1/organizations/${organizationId}/members`,
      {
        email: 'newuser@example.com',  // Email of user to invite
        role: 'member'                 // Role they'll have when they join
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Organization invitation response:', response.data);
    
    // Expected response when user doesn't exist:
    // {
    //   "message": "Invitation sent successfully",
    //   "invited": true,
    //   "email": "newuser@example.com"
    // }
    
    // Expected response when user exists:
    // {
    //   "organization": { /* updated organization object with new member */ },
    //   "message": "Member added successfully"
    // }
    
  } catch (error) {
    console.error('Error inviting user to organization:', error.response?.data || error.message);
  }
}

// Example usage
console.log('Example 1: Inviting user to team');
inviteUserToTeam();

console.log('\nExample 2: Inviting user to organization');
inviteUserToOrganization();

// To run this example:
// 1. Replace 'your-auth-token-here' with a valid authentication token
// 2. Replace 'team-id-here' and 'organization-id-here' with actual IDs
// 3. Run: node example-invitation-only.js