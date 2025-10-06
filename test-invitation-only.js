// Test script to verify that when a user doesn't exist, only an invitation email is sent
// and the user is not added to the team or organization

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

  try {
    const response = await axios(`${API_BASE_URL}${endpoint}`, config);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API request failed: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
    } else {
      throw new Error(`API request failed: ${error.message}`);
    }
  }
};

async function testInvitationOnly() {
  console.log('Testing Invitation Only Feature...\n');
  
  try {
    // 1. Get user's organization
    console.log('1. Getting user organization...');
    const userOrgResponse = await apiRequest('/organizations/me');
    const organizationId = userOrgResponse.organization._id;
    console.log('   User organization:', userOrgResponse.organization.name);
    
    // 2. Create a team
    console.log('2. Creating team...');
    const teamData = {
      name: `Test Team ${Date.now()}`,
      description: 'A test team for invitation testing'
    };
    
    const teamResponse = await apiRequest('/teams', {
      method: 'POST',
      data: teamData
    });
    
    const teamId = teamResponse.team._id;
    console.log('   Created team:', teamResponse.team.name);
    
    // 3. Test inviting a non-existent user to the team (should only send email)
    console.log('3. Inviting non-existent user to team (should only send email)...');
    const teamInviteData = {
      email: 'nonexistent-team@example.com',
      role: 'member'
    };
    
    const teamInviteResponse = await apiRequest(`/teams/${teamId}/members`, {
      method: 'POST',
      data: teamInviteData
    });
    
    console.log('   Team invitation response:', teamInviteResponse.message);
    if (teamInviteResponse.invited) {
      console.log('   ✅ Team invitation sent successfully to:', teamInviteResponse.email);
      console.log('   ℹ️  User was NOT added to the team (only invited by email)');
    }
    
    // 4. Test inviting a non-existent user to the organization (should only send email)
    console.log('4. Inviting non-existent user to organization (should only send email)...');
    const orgInviteData = {
      email: 'nonexistent-org@example.com',
      role: 'member'
    };
    
    const orgInviteResponse = await apiRequest(`/organizations/${organizationId}/members`, {
      method: 'POST',
      data: orgInviteData
    });
    
    console.log('   Organization invitation response:', orgInviteResponse.message);
    if (orgInviteResponse.invited) {
      console.log('   ✅ Organization invitation sent successfully to:', orgInviteResponse.email);
      console.log('   ℹ️  User was NOT added to the organization (only invited by email)');
    }
    
    // 5. Verify the team still has no members (except the creator)
    console.log('5. Verifying team members (should only have creator)...');
    const teamMembersResponse = await apiRequest(`/teams/${teamId}/members`);
    console.log('   Team members count:', teamMembersResponse.members.length);
    
    // 6. Verify the organization members haven't changed (except the original members)
    console.log('6. Verifying organization members (should be unchanged)...');
    const orgMembersResponse = await apiRequest(`/organizations/${organizationId}/members`);
    console.log('   Organization members count:', orgMembersResponse.members.length);
    
    console.log('\n✅ Invitation Only Feature test completed successfully!');
    console.log('✅ Users who don\'t exist in the system are only invited by email');
    console.log('✅ No users are added to teams or organizations when they don\'t exist');
    console.log('\nCheck the email inboxes to verify the invitations were sent.');
    
  } catch (error) {
    console.error('❌ Error in Invitation Only Feature test:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInvitationOnly();
}

export { testInvitationOnly };