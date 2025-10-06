import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';

async function testTaskAndDocumentFeatures() {
  try {
    console.log('Testing Task and Document features...\n');
    
    // Register a new user
    console.log('1. Registering a new user...');
    const registerResponse = await axios.post(`${API_BASE}/register`, {
      email: 'task_test@example.com',
      password: 'password123',
      firstName: 'Task',
      lastName: 'Test'
    });
    
    const { accessToken } = registerResponse.data;
    console.log('User registered successfully!\n');
    
    // Create a project
    console.log('2. Creating a project...');
    const projectResponse = await axios.post(`${API_BASE}/projects`, {
      name: 'Test Project',
      description: 'A test project for tasks and documents'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const projectId = projectResponse.data.project._id;
    console.log('Project created successfully!\n');
    
    // Create a task
    console.log('3. Creating a task...');
    const taskResponse = await axios.post(`${API_BASE}/tasks`, {
      title: 'Test Task',
      description: 'A test task',
      projectId: projectId,
      status: 'todo',
      priority: 'medium'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const taskId = taskResponse.data.task._id;
    console.log('Task created successfully!\n');
    
    // Update task status
    console.log('4. Updating task status...');
    await axios.put(`${API_BASE}/tasks/${taskId}`, {
      status: 'inProgress'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Task status updated successfully!\n');
    
    // Create a document
    console.log('5. Creating a document...');
    const documentResponse = await axios.post(`${API_BASE}/documents`, {
      title: 'Test Document',
      content: '# Test Document\n\nThis is a test document.',
      projectId: projectId
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const documentId = documentResponse.data.document._id;
    console.log('Document created successfully!\n');
    
    // Update document content
    console.log('6. Updating document content...');
    await axios.put(`${API_BASE}/documents/${documentId}/content`, {
      content: '# Test Document\n\nThis is an updated test document with more content.'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log('Document content updated successfully!\n');
    
    // Get document versions
    console.log('7. Getting document versions...');
    const versionsResponse = await axios.get(`${API_BASE}/documents/${documentId}/versions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    console.log(`Found ${versionsResponse.data.versions.length} versions\n`);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testTaskAndDocumentFeatures();