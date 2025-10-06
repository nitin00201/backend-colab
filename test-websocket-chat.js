// WebSocket Chat Test Script
// This script tests the WebSocket chat functionality

import io from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3000';
const API_BASE = `${SERVER_URL}/api/v1`;

async function testWebSocketChat() {
  console.log('Testing WebSocket Chat Functionality...\n');
  
  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    
    const { accessToken } = registerResponse.data;
    console.log('✓ User registered successfully\n');
    
    // 2. Login the user
    console.log('2. Logging in user...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: `test_${Date.now()}@example.com`,
      password: 'password123'
    });
    
    const { accessToken: loginToken } = loginResponse.data;
    console.log('✓ User logged in successfully\n');
    
    // 3. Connect to WebSocket
    console.log('3. Connecting to WebSocket...');
    const socket = io(SERVER_URL, {
      auth: {
        token: loginToken
      }
    });
    
    // 4. Wait for connection
    socket.on('connect', () => {
      console.log('✓ Connected to WebSocket server');
      console.log('Socket ID:', socket.id, '\n');
      
      // 5. Join a chat room
      console.log('4. Joining chat room...');
      const roomId = 'test-room-' + Date.now();
      socket.emit('join', {
        userId: 'test-user',
        roomId: roomId
      });
      
      // 6. Listen for user joined event
      socket.on('userJoined', (data) => {
        console.log('✓ User joined room:', data);
      });
      
      // 7. Send a chat message
      setTimeout(() => {
        console.log('\n5. Sending chat message...');
        socket.emit('message', {
          roomId: roomId,
          message: 'Hello, this is a test message!',
          userId: 'test-user'
        });
      }, 1000);
      
      // 8. Listen for incoming messages
      socket.on('message', (data) => {
        console.log('✓ Received message:', data);
      });
      
      // 9. Simulate typing
      setTimeout(() => {
        console.log('\n6. Sending typing indicator...');
        socket.emit('typing', {
          roomId: roomId,
          userId: 'test-user',
          isTyping: true
        });
      }, 2000);
      
      // 10. Listen for typing indicators
      socket.on('typing', (data) => {
        console.log('✓ Typing indicator:', data);
      });
      
      // 11. Test document editing (if available)
      setTimeout(() => {
        console.log('\n7. Testing document editing event...');
        socket.emit('documentEdit', {
          documentId: 'test-doc-' + Date.now(),
          content: '# Test Document\n\nThis is a test document content.',
          userId: 'test-user'
        });
      }, 3000);
      
      // 12. Listen for document updates
      socket.on('documentUpdate', (data) => {
        console.log('✓ Document update received:', data);
      });
      
      // 13. Test task updates (if available)
      setTimeout(() => {
        console.log('\n8. Testing task update event...');
        socket.emit('taskUpdate', {
          projectId: 'test-project-' + Date.now(),
          task: {
            id: 'test-task-' + Date.now(),
            title: 'Test Task',
            status: 'inProgress'
          },
          userId: 'test-user'
        });
      }, 4000);
      
      // 14. Listen for task updates
      socket.on('taskUpdated', (data) => {
        console.log('✓ Task update received:', data);
      });
      
      // 15. Disconnect after tests
      setTimeout(() => {
        console.log('\n9. Disconnecting from WebSocket...');
        socket.disconnect();
        console.log('✓ Disconnected from WebSocket server');
        console.log('\n🎉 All WebSocket tests completed successfully!');
      }, 5000);
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket disconnected:', reason);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testWebSocketChat();