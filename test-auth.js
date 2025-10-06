import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';

async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...\n');
    
    // Register a new user
    console.log('1. Registering a new user...');
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    console.log('Registration successful!');
    console.log('Access Token:', registerResponse.data.accessToken);
    console.log('Refresh Token:', registerResponse.data.refreshToken);
    console.log('');
    
    // Login with the same user
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('Access Token:', loginResponse.data.accessToken);
    console.log('Refresh Token:', loginResponse.data.refreshToken);
    console.log('');
    
    // Get user profile
    console.log('3. Getting user profile...');
    const profileResponse = await axios.get(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.accessToken}`
      }
    });
    
    console.log('Profile retrieved successfully!');
    console.log('User:', profileResponse.data.user);
    console.log('');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testAuthFlow();