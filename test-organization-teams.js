// Test script for Organization and Teams APIs
// This script demonstrates how to use the Organization and Teams APIs

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
async function testOrganizationAPIs() {
  console.log('Testing Organization APIs...\n');
  
  try {
    // 1. Create an organization
    console.log('1. Creating organization...');
    const orgData = {
      name: `Test Organization ${Date.now()}`,
      description: 'A test organization for API testing'
    };
    
    const orgResponse = await apiRequest('/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData)
    });
    
    const organizationId = orgResponse.organization._id;
    console.log('   Created organization:', orgResponse.organization.name);
    
    // 2. Get user's organization
    console.log('2. Getting user organization...');
    const userOrgResponse = await apiRequest('/organizations/me');
    console.log('   User organization:', userOrgResponse.organization.name);
    
    // 3. Get organization by ID
    console.log('3. Getting organization by ID...');
    const orgByIdResponse = await apiRequest(`/organizations/${organizationId}`);
    console.log('   Organization by ID:', orgByIdResponse.organization.name);
    
    // 4. Get organization members
    console.log('4. Getting organization members...');
    const orgMembersResponse = await apiRequest(`/organizations/${organizationId}/members`);
    console.log('   Organization members count:', orgMembersResponse.members.length);
    
    // 5. Update organization
    console.log('5. Updating organization...');
    const updateData = {
      description: 'Updated test organization description'
    };
    
    const updateResponse = await apiRequest(`/organizations/${organizationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    console.log('   Updated organization description:', updateResponse.organization.description);
    
    console.log('\nOrganization API tests completed successfully!\n');
    return organizationId;
  } catch (error) {
    console.error('Error in Organization API tests:', error.message);
    throw error;
  }
}

async function testTeamAPIs(organizationId) {
  console.log('Testing Team APIs...\n');
  
  try {
    // 1. Create a team
    console.log('1. Creating team...');
    const teamData = {
      name: `Test Team ${Date.now()}`,
      description: 'A test team for API testing',
      organization: organizationId
    };
    
    const teamResponse = await apiRequest('/teams', {
      method: 'POST',
      body: JSON.stringify(teamData)
    });
    
    const teamId = teamResponse.team._id;
    console.log('   Created team:', teamResponse.team.name);
    
    // 2. Get all teams in organization
    console.log('2. Getting all teams...');
    const teamsResponse = await apiRequest('/teams');
    console.log('   Teams count:', teamsResponse.teams.length);
    
    // 3. Get team by ID
    console.log('3. Getting team by ID...');
    const teamByIdResponse = await apiRequest(`/teams/${teamId}`);
    console.log('   Team by ID:', teamByIdResponse.team.name);
    
    // 4. Get team members
    console.log('4. Getting team members...');
    const teamMembersResponse = await apiRequest(`/teams/${teamId}/members`);
    console.log('   Team members count:', teamMembersResponse.members.length);
    
    // 5. Update team
    console.log('5. Updating team...');
    const updateData = {
      description: 'Updated test team description'
    };
    
    const updateTeamResponse = await apiRequest(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
    console.log('   Updated team description:', updateTeamResponse.team.description);
    
    console.log('\nTeam API tests completed successfully!\n');
    return teamId;
  } catch (error) {
    console.error('Error in Team API tests:', error.message);
    throw error;
  }
}

async function runTests() {
  console.log('Starting Organization and Teams API tests...\n');
  
  try {
    // Note: In a real test, you would first authenticate and get a token
    // For this example, we're assuming authentication is handled separately
    
    // Test Organization APIs
    const organizationId = await testOrganizationAPIs();
    
    // Test Team APIs
    const teamId = await testTeamAPIs(organizationId);
    
    console.log('All API tests completed successfully!');
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

export { testOrganizationAPIs, testTeamAPIs, apiRequest };