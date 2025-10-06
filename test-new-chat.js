// Test script for new chat functionality
import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:3000/api/v1';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/monolith');

async function testNewChatFunctionality() {
  console.log('Testing New Chat Functionality...\n');
  
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
    
    const chatId = chatResponse.data._id;
    console.log(`✓ Chat room created with ID: ${chatId}\n`);
    
    // 4. Fetch chat rooms for user 1
    console.log('4. Fetching chat rooms for User 1...');
    
    const chatsResponse1 = await axios.get(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    console.log(`✓ User 1 has ${chatsResponse1.data.rooms.length} chat rooms\n`);
    
    // 5. Fetch chat rooms for user 2
    console.log('5. Fetching chat rooms for User 2...');
    
    const chatsResponse2 = await axios.get(`${API_URL}/chats`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    
    console.log(`✓ User 2 has ${chatsResponse2.data.rooms.length} chat rooms\n`);
    
    // 6. Send a message from user 1
    console.log('6. Sending message from User 1...');
    
    const messageData = {
      content: 'Hello from User 1!'
    };
    
    const messageResponse = await axios.post(`${API_URL}/chats/${chatId}/messages`, messageData, {
      headers: { Authorization: `Bearer ${token1}` }
    });
    
    console.log(`✓ Message sent with ID: ${messageResponse.data._id}\n`);
    
    // 7. Fetch messages for user 2
    console.log('7. Fetching messages for User 2...');
    
    const messagesResponse = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token2}` }
    });
    
    console.log(`✓ Retrieved ${messagesResponse.data.length} messages\n`);
    
    // 8. Verify message content
    if (messagesResponse.data.length > 0) {
      const message = messagesResponse.data[0];
      console.log(`Message content: ${message.content}`);
      console.log(`Message sender: ${message.sender.firstName} ${message.sender.lastName}`);
      console.log(`Message timestamp: ${message.timestamp}\n`);
    }
    
    console.log('🎉 All new chat functionality tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
  }
}

// Run the test
testNewChatFunctionality();