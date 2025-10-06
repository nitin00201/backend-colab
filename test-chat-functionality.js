// Test script for chat functionality
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:3000/api/v1';
const SOCKET_URL = 'http://localhost:3000';

async function testChatFunctionality() {
  console.log('Testing Chat Functionality...\n');
  
  try {
    // 1. Register two test users
    console.log('1. Registering test users...');
    
    const user1Data = {
      email: `user1_${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'User',
      lastName: 'One'
    };
    
    const user2Data = {
      email: `user2_${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'User',
      lastName: 'Two'
    };
    
    const user1Response = await axios.post(`${API_URL}/register`, user1Data);
    const user2Response = await axios.post(`${API_URL}/register`, user2Data);
    
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
    
    const token1 = login1Response.data.accessToken;
    const token2 = login2Response.data.accessToken;
    
    console.log('✓ Users logged in successfully\n');
    
    // 3. Create a chat room
    console.log('3. Creating chat room...');
    
    const chatData = {
      name: 'Test Chat Room',
      type: 'direct',
      participants: [user1Response.data.user._id, user2Response.data.user._id]
    };
    
    const chatResponse = await axios.post(`${API_URL}/chats`, chatData, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    const chatId = chatResponse.data.id;
    console.log(`✓ Chat room created with ID: ${chatId}\n`);
    
    // 4. Connect both users to WebSocket
    console.log('4. Connecting to WebSocket...');
    
    const socket1 = io(SOCKET_URL, {
      auth: { token: token1 }
    });
    
    const socket2 = io(SOCKET_URL, {
      auth: { token: token2 }
    });
    
    // Wait for connections
    await new Promise(resolve => {
      let connected1 = false;
      let connected2 = false;
      
      socket1.on('connect', () => {
        console.log('✓ User 1 connected to WebSocket');
        connected1 = true;
        if (connected1 && connected2) resolve(null);
      });
      
      socket2.on('connect', () => {
        console.log('✓ User 2 connected to WebSocket');
        connected2 = true;
        if (connected1 && connected2) resolve(null);
      });
    });
    
    console.log('');
    
    // 5. Join chat room
    console.log('5. Joining chat room...');
    
    socket1.emit('join', {
      userId: user1Response.data.user._id,
      roomId: chatId
    });
    
    socket2.emit('join', {
      userId: user2Response.data.user._id,
      roomId: chatId
    });
    
    console.log('✓ Users joined chat room\n');
    
    // 6. Send a message from user 1
    console.log('6. Sending message from User 1...');
    
    // Listen for message on user 2
    const messagePromise = new Promise(resolve => {
      socket2.on('message', (data) => {
        console.log(`✓ User 2 received message: ${data.message}`);
        resolve(data);
      });
    });
    
    // Send message from user 1
    socket1.emit('message', {
      roomId: chatId,
      message: 'Hello from User 1!',
      userId: user1Response.data.user._id,
      userName: 'User One'
    });
    
    // Wait for message to be received
    await messagePromise;
    
    console.log('✓ Message sent and received successfully\n');
    
    // 7. Test typing indicator
    console.log('7. Testing typing indicator...');
    
    const typingPromise = new Promise(resolve => {
      socket2.on('typing', (data) => {
        console.log(`✓ User 2 received typing indicator: ${data.userName} is ${data.isTyping ? 'typing' : 'not typing'}`);
        resolve(data);
      });
    });
    
    // Send typing indicator
    socket1.emit('typing', {
      roomId: chatId,
      userId: user1Response.data.user._id,
      userName: 'User One',
      isTyping: true
    });
    
    await typingPromise;
    
    console.log('✓ Typing indicator test completed\n');
    
    // 8. Fetch chat messages via API
    console.log('8. Fetching chat messages via API...');
    
    const messagesResponse = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    console.log(`✓ Retrieved ${messagesResponse.data.length} messages\n`);
    
    // 9. Clean up
    console.log('9. Cleaning up...');
    
    socket1.disconnect();
    socket2.disconnect();
    
    console.log('✓ Disconnected from WebSocket\n');
    
    console.log('🎉 All chat functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testChatFunctionality();