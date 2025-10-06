// Test script for Organization Members API
// This script demonstrates how to use the Organization Members API to ensure only organization users are shown

import fetch from 'node-fetch';
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  
  return response.json();
};

// Test functions
async function testOrganizationMembersAPI() {
  console.log('Testing Organization Members API...\n');
  
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
    
    // 3. Display organization members
    console.log('   Organization members:');
    orgMembersResponse.members.forEach((member, index) => {
      console.log(`     ${index + 1}. ${member.user.firstName} ${member.user.lastName} (${member.user.email}) - ${member.role}`);
    });
    
    // 4. Create a team
    console.log('3. Creating team...');
    const teamData = {
      name: `Test Team ${Date.now()}`,
      description: 'A test team for member testing'
    };
    
    const teamResponse = await apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
    
    const teamId = teamResponse.team._id;
    console.log('   Created team:', teamResponse.team.name);
    
    // 5. Get team members (should be empty initially)
    console.log('4. Getting team members...');
    const teamMembersResponse = await apiRequest(`/teams/${teamId}/members`);
    console.log('   Team members count:', teamMembersResponse.members.length);
    
    // 6. Add a member to the team (only from organization members)
    if (orgMembersResponse.members.length > 0) {
      console.log('5. Adding member to team...');
      const memberToAdd = orgMembersResponse.members[0];
      const addMemberData = {
        userId: memberToAdd.user._id,
        role: 'member'
      };
      
      const addMemberResponse = await apiRequest(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify(addMemberData)
      });
      
      console.log('   Added member to team:', memberToAdd.user.firstName, memberToAdd.user.lastName);
      console.log('   Updated team members count:', addMemberResponse.team.members.length);
    }
    
    console.log('\nOrganization Members API tests completed successfully!\n');
    return { organizationId, teamId };
  } catch (error) {
    console.error('Error in Organization Members API tests:', error.message);
    throw error;
  }
}

async function runTests() {
  console.log('Starting Organization Members API tests...\n');
  
  try {
    // Note: In a real test, you would first authenticate and get a token
    // For this example, we're assuming authentication is handled separately
    
    // Test Organization Members APIs
    const { organizationId, teamId } = await testOrganizationMembersAPI();
    
    console.log('All Organization Members API tests completed successfully!');
    console.log('Organization ID:', organizationId);
    console.log('Team ID:', teamId);
  } catch (error) {
    console.error('Tests failed:', error.message);
    process.exit(1);
  }
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testOrganizationMembersAPI, apiRequest };