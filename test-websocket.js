// Simple test to verify WebSocket functionality
// This would typically be run in a separate test environment

import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3000/api/v1';

async function testWebSocket() {
  console.log('Testing WebSocket functionality...');
  
  // Register a test user
  try {
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      email: 'websocket_test@example.com',
      password: 'password123',
      firstName: 'WebSocket',
      lastName: 'Test'
    });
    
    const { accessToken } = registerResponse.data;
    console.log('User registered successfully');
    
    // Connect to WebSocket
    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      }
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Join a room
      socket.emit('join', {
        userId: 'websocket_test_user',
        roomId: 'test_room'
      });
      
      // Send a message
      socket.emit('message', {
        roomId: 'test_room',
        message: 'Hello from WebSocket test!',
        userId: 'websocket_test_user'
      });
    });
    
    socket.on('message', (data) => {
      console.log('Received message:', data);
    });
    
    socket.on('userJoined', (data) => {
      console.log('User joined:', data);
    });
    
    // Wait a bit then disconnect
    setTimeout(() => {
      socket.disconnect();
      console.log('Disconnected from WebSocket server');
    }, 5000);
    
  } catch (error) {
    console.error('WebSocket test failed:', error.message);
  }
}

// Run the test
testWebSocket();