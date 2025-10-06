// Test script for invitation feature
// This script tests the email invitation functionality for users not in the system

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
let authToken = null;

// Helper function to make authenticated requests
const apiRequest = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  const response = await axios(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
};

async function testInvitationFeature() {
  console.log('Testing Invitation Feature...\n');
  
  try {
    // 1. Get user's organization
    console.log('1. Getting user organization...');
    const userOrgResponse = await apiRequest('/organizations/me');
    const organizationId = userOrgResponse.organization._id;
    console.log('   User organization:', userOrgResponse.organization.name);
    
    // 2. Get organization members
    console.log('2. Getting organization members...');
    const orgMembersResponse = await apiRequest(`/organizations/${organizationId}/members`);
    console.log('   Organization members count:', orgMembersResponse.members.length);
    
    // 3. Create a team
    console.log('3. Creating team...');
    const teamData = {
      name: `Test Team ${Date.now()}`,
      description: 'A test team for invitation testing'
    };
    
    const teamResponse = await apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
    
    const teamId = teamResponse.team._id;
    console.log('   Created team:', teamResponse.team.name);
    
    // 4. Test inviting a non-existent user to the team
    console.log('4. Inviting non-existent user to team...');
    const inviteData = {
      email: 'nonexistent@example.com',
      role: 'member'
    };
    
    const inviteResponse = await apiRequest(`/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(inviteData)
    });
    
    console.log('   Invitation response:', inviteResponse.message);
    if (inviteResponse.invited) {
      console.log('   ✅ Invitation sent successfully to:', inviteResponse.email);
    }
    
    // 5. Test inviting a non-existent user to the organization
    console.log('5. Inviting non-existent user to organization...');
    const orgInviteData = {
      email: 'nonexistent-org@example.com',
      role: 'member'
    };
    
    const orgInviteResponse = await apiRequest(`/organizations/${organizationId}/members`, {
      method: 'POST',
      body: JSON.stringify(orgInviteData)
    });
    
    console.log('   Organization invitation response:', orgInviteResponse.message);
    if (orgInviteResponse.invited) {
      console.log('   ✅ Organization invitation sent successfully to:', orgInviteResponse.email);
    }
    
    console.log('\nInvitation Feature test completed successfully!');
    console.log('Check the email inboxes to verify the invitations were sent.');
    
  } catch (error) {
    console.error('Error in Invitation Feature test:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInvitationFeature();
}

export { testInvitationFeature };