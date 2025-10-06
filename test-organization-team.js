// Test script for organization and team functionality
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3000/api/v1';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monolith');

async function testOrganizationTeamFunctionality() {
  console.log('Testing Organization and Team Functionality...\n');
  
  let user1Token, user2Token, user1Id, user2Id, organizationId, teamId;
  
  try {
    // 1. Register two test users
    console.log('1. Registering test users...');
    
    const user1Data = {
      email: `org_user1_${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'Org',
      lastName: 'User1'
    };
    
    const user2Data = {
      email: `org_user2_${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'Org',
      lastName: 'User2'
    };
    
    const user1Response = await axios.post(`${API_URL}/register`, user1Data);
    const user2Response = await axios.post(`${API_URL}/register`, user2Data);
    
    user1Id = user1Response.data.user._id;
    user2Id = user2Response.data.user._id;
    
    console.log('✓ Users registered successfully\n');
    
    // 2. Login both users
    console.log('2. Logging in users...');
    
    const login1Response = await axios.post(`${API_URL}/login`, {
      email: user1Data.email,
      password: user1Data.password
    });
    
    const login2Response = await axios.post(`${API_URL}/login`, {
      email: user2Data.email,
      password: user2Data.password
    });
    
    user1Token = login1Response.data.accessToken;
    user2Token = login2Response.data.accessToken;
    
    console.log('✓ Users logged in successfully\n');
    
    // 3. Create an organization
    console.log('3. Creating organization...');
    
    const orgData = {
      name: 'Test Organization',
      description: 'A test organization for testing purposes'
    };
    
    const orgResponse = await axios.post(`${API_URL}/organizations`, orgData, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    organizationId = orgResponse.data.organization._id;
    console.log(`✓ Organization created with ID: ${organizationId}\n`);
    
    // 4. Add user2 to the organization
    console.log('4. Adding user2 to organization...');
    
    await axios.post(`${API_URL}/organizations/${organizationId}/members`, {
      userId: user2Id,
      role: 'member'
    }, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log('✓ User2 added to organization\n');
    
    // 5. Create a team
    console.log('5. Creating team...');
    
    const teamData = {
      name: 'Test Team',
      description: 'A test team for testing purposes'
    };
    
    const teamResponse = await axios.post(`${API_URL}/teams`, teamData, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    teamId = teamResponse.data.team._id;
    console.log(`✓ Team created with ID: ${teamId}\n`);
    
    // 6. Add user2 to the team
    console.log('6. Adding user2 to team...');
    
    await axios.post(`${API_URL}/teams/${teamId}/members`, {
      userId: user2Id,
      role: 'member'
    }, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log('✓ User2 added to team\n');
    
    // 7. Create a project under the organization
    console.log('7. Creating project...');
    
    const projectData = {
      name: 'Test Project',
      description: 'A test project for testing purposes'
    };
    
    const projectResponse = await axios.post(`${API_URL}/projects`, projectData, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    const projectId = projectResponse.data.project._id;
    console.log(`✓ Project created with ID: ${projectId}\n`);
    
    // 8. Fetch organization details
    console.log('8. Fetching organization details...');
    
    const orgDetailsResponse = await axios.get(`${API_URL}/organizations/me`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log(`✓ Organization has ${orgDetailsResponse.data.organization.members.length} members\n`);
    
    // 9. Fetch team details
    console.log('9. Fetching team details...');
    
    const teamDetailsResponse = await axios.get(`${API_URL}/teams/${teamId}`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log(`✓ Team has ${teamDetailsResponse.data.team.members.length} members\n`);
    
    // 10. Fetch projects for organization
    console.log('10. Fetching projects for organization...');
    
    const projectsResponse = await axios.get(`${API_URL}/projects`, {
      headers: { Authorization: `Bearer ${user1Token}` }
    });
    
    console.log(`✓ Found ${projectsResponse.data.projects.length} projects\n`);
    
    console.log('🎉 All organization and team functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
  }
}

// Run the test
testOrganizationTeamFunctionality();