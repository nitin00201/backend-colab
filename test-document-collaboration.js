// Document Collaboration Test Script
// This script tests the WebSocket document collaboration functionality

import io from 'socket.io-client';
import axios from 'axios';

const SERVER_URL = 'http://localhost:3000';
const API_BASE = `${SERVER_URL}/api/v1`;

async function testDocumentCollaboration() {
  console.log('Testing Document Collaboration Functionality...\n');
  
  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      email: `doc_test_${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Doc',
      lastName: 'Tester'
    });
    
    const { accessToken } = registerResponse.data;
    console.log('✓ User registered successfully\n');
    
    // 2. Login the user
    console.log('2. Logging in user...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: `doc_test_${Date.now()}@example.com`,
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
      
      // 5. Test document editing
      console.log('4. Testing document editing...');
      const documentId = 'test-document-' + Date.now();
      
      // Simulate multiple edits to the same document
      const edits = [
        '# Test Document\n\nThis is the initial content.',
        '# Test Document\n\nThis is the updated content.',
        '# Test Document\n\nThis is the final content with more details.'
      ];
      
      let editIndex = 0;
      const sendEdit = () => {
        if (editIndex < edits.length) {
          const content = edits[editIndex];
          console.log(`Sending edit ${editIndex + 1}:`, content.substring(0, 30) + '...');
          
          socket.emit('documentEdit', {
            documentId: documentId,
            content: content,
            userId: 'test-user'
          });
          
          editIndex++;
          setTimeout(sendEdit, 2000);
        }
      };
      
      sendEdit();
    });
    
    // 6. Listen for document updates
    socket.on('documentUpdate', (data) => {
      console.log('✓ Document update received:', {
        documentId: data.documentId,
        userId: data.userId,
        contentLength: data.content?.length || 0
      });
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('⚠️ WebSocket disconnected:', reason);
    });
    
    // 7. Disconnect after tests
    setTimeout(() => {
      console.log('\n5. Disconnecting from WebSocket...');
      socket.disconnect();
      console.log('✓ Disconnected from WebSocket server');
      console.log('\n🎉 Document collaboration tests completed!');
    }, 10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testDocumentCollaboration();