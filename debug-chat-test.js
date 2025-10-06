// Simple debug test for chat functionality
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';

async function debugChatTest() {
  console.log('Debugging Chat Functionality...\n');
  
  try {
    // 1. Register a test user
    console.log('1. Registering test user...');
    
    const userData = {
      email: `debug_${Date.now()}@test.com`,
      password: 'password123',
      firstName: 'Debug',
      lastName: 'User'
    };
    
    const userResponse = await axios.post(`${API_URL}/register`, userData);
    console.log('User response:', userResponse.data);
    
    const userId = userResponse.data.user._id;
    console.log('User ID:', userId);
    
    // 2. Login the user
    console.log('2. Logging in user...');
    
    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: userData.email,
      password: userData.password
    });
    
    const token = loginResponse.data.accessToken;
    console.log('Token received:', token ? 'Yes' : 'No');
    
    // 3. Create a chat room
    console.log('3. Creating chat room...');
    
    const chatData = {
      name: 'Debug Chat Room',
      type: 'direct',
      participants: [userId]
    };
    
    const chatResponse = await axios.post(`${API_URL}/chats`, chatData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Chat room created:', chatResponse.data);
    
    const chatId = chatResponse.data.id;
    
    // 4. Fetch the chat room
    console.log('4. Fetching chat room...');
    
    const fetchResponse = await axios.get(`${API_URL}/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Chat room fetched:', fetchResponse.data);
    
    // 5. Fetch chat messages
    console.log('5. Fetching chat messages...');
    
    const messagesResponse = await axios.get(`${API_URL}/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Messages fetched:', messagesResponse.data);
    
    console.log('🎉 Debug test completed successfully!');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the debug test
debugChatTest();