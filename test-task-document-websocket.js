// Simple test to verify WebSocket functionality for tasks and documents
// This would typically be run in a separate test environment

import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:3000/api/v1';

async function testTaskDocumentWebSocket() {
  console.log('Testing Task and Document WebSocket functionality...');
  
  // Register a test user
  try {
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      email: 'websocket_task_test@example.com',
      password: 'password123',
      firstName: 'WebSocket',
      lastName: 'TaskTest'
    });
    
    const { accessToken } = registerResponse.data;
    console.log('User registered successfully');
    
    // Create a project
    const projectResponse = await axios.post(`${API_BASE}/projects`, {
      name: 'WebSocket Test Project',
      description: 'A test project for WebSocket functionality'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const projectId = projectResponse.data.project._id;
    console.log('Project created successfully');
    
    // Connect to WebSocket
    const socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      }
    });
    
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Join project room
      socket.emit('join', {
        userId: 'websocket_task_test_user',
        roomId: `project-${projectId}`
      });
      
      // Simulate task update
      setTimeout(() => {
        socket.emit('taskUpdate', {
          projectId: projectId,
          task: {
            _id: 'test-task-id',
            title: 'Test Task',
            status: 'inProgress'
          },
          userId: 'websocket_task_test_user'
        });
      }, 1000);
      
      // Simulate document edit
      setTimeout(() => {
        socket.emit('documentEdit', {
          documentId: 'test-document-id',
          content: '# Test Document\n\nThis is a test document content.',
          userId: 'websocket_task_test_user'
        });
      }, 2000);
    });
    
    socket.on('taskUpdated', (data) => {
      console.log('Task updated:', data);
    });
    
    socket.on('documentUpdate', (data) => {
      console.log('Document updated:', data);
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
testTaskDocumentWebSocket();