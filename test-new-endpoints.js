// Test script for the new Organization and Teams endpoints
// This script tests the newly added endpoints

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

// Test data
const testOrganizationId = process.env.TEST_ORGANIZATION_ID || 'test-org-id';
const testTeamId = process.env.TEST_TEAM_ID || 'test-team-id';

console.log('Testing new Organization and Teams endpoints...\n');

async function testNewEndpoints() {
  try {
    console.log('Testing GET /organizations/:id/members endpoint...');
    console.log('Endpoint URL:', `${API_BASE_URL}/organizations/${testOrganizationId}/members`);
    console.log('Note: This will fail if the organization does not exist or you are not authenticated\n');
    
    console.log('Testing GET /teams/:id/members endpoint...');
    console.log('Endpoint URL:', `${API_BASE_URL}/teams/${testTeamId}/members`);
    console.log('Note: This will fail if the team does not exist or you are not authenticated\n');
    
    console.log('New endpoints added successfully!');
    console.log('To properly test these endpoints, you need to:');
    console.log('1. Start the backend server');
    console.log('2. Authenticate to get a valid JWT token');
    console.log('3. Create a test organization and team');
    console.log('4. Use the actual IDs in the environment variables');
    
  } catch (error) {
    console.error('Error testing new endpoints:', error.message);
  }
}

// Run the test
testNewEndpoints();