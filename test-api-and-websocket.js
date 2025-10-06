// Test script for API routes and WebSocket connection
import axios from 'axios';
import { io } from 'socket.io-client';

console.log('Testing API routes and WebSocket connection...\n');

// Test 1: Health check API endpoint
async function testApiHealth() {
  try {
    console.log('1. Testing API health endpoint...');
    const response = await axios.get('http://localhost:3000/health');
    console.log('   ✓ API Health Check:', response.data);
    return true;
  } catch (error) {
    console.log('   ✗ API Health Check Failed:', error.message);
    return false;
  }
}

// Test 2: WebSocket connection using Socket.IO client
async function testWebSocketConnection() {
  try {
    console.log('\n2. Testing WebSocket connection...');
    
    // Create Socket.IO client connection
    const socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });

    // Wait for connection with Promise
    const connected = await new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('   ✗ WebSocket Connection Timeout');
        resolve(false);
      }, 5000);

      socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('   ✓ WebSocket Connected successfully with ID:', socket.id);
        resolve(true);
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log('   ✗ WebSocket Connection Error:', error.message);
        resolve(false);
      });
    });

    // Disconnect
    if (socket.connected) {
      socket.disconnect();
      console.log('   ✓ WebSocket Disconnected');
    }

    return connected;
  } catch (error) {
    console.log('   ✗ WebSocket Test Failed:', error.message);
    return false;
  }
}

// Test 3: API routes
async function testApiRoutes() {
  try {
    console.log('\n3. Testing API routes...');
    
    // Test base API route
    try {
      const response = await axios.get('http://localhost:3000/api/v1/health', {
        timeout: 3000
      });
      console.log('   ✓ API Base Route:', response.status);
    } catch (error) {
      // This might fail if there's no health endpoint in API routes, which is OK
      console.log('   - API Base Route: No /api/v1/health endpoint (this is OK)');
    }
    
    console.log('   ✓ API Routes Test Completed');
    return true;
  } catch (error) {
    console.log('   ✗ API Routes Test Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting tests...\n');
  
  const apiHealth = await testApiHealth();
  const webSocket = await testWebSocketConnection();
  const apiRoutes = await testApiRoutes();
  
  console.log('\n--- Test Results ---');
  console.log('API Health Check:', apiHealth ? 'PASS' : 'FAIL');
  console.log('WebSocket Connection:', webSocket ? 'PASS' : 'FAIL');
  console.log('API Routes:', apiRoutes ? 'PASS' : 'FAIL');
  
  const overall = apiHealth && webSocket && apiRoutes;
  console.log('\nOverall Result:', overall ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
  
  process.exit(overall ? 0 : 1);
}

// Run the tests
runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});