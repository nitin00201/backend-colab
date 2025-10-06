import inngest from './src/utils/inngest.js'

async function testInngestFunctions() {
  console.log('Testing Inngest functions...');
  
  try {
    // Test task.created event
    console.log('1. Sending task.created event...');
    await inngest.send({
      name: 'task.created',
      data: {
        task: {
          _id: 'test-task-id',
          title: 'Test Task',
          description: 'This is a test task',
          status: 'todo',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        userId: 'test-user-id'
      }
    });
    console.log('Task created event sent successfully!');
    
    // Test doc.updated event
    console.log('2. Sending doc.updated event...');
    await inngest.send({
      name: 'doc.updated',
      data: {
        document: {
          _id: 'test-document-id',
          title: 'Test Document',
          content: 'This is a test document content',
          version: 1
        },
        userId: 'test-user-id',
        updaterName: 'Test User'
      }
    });
    console.log('Document updated event sent successfully!');
    
    // Test chat.message event
    console.log('3. Sending chat.message event...');
    await inngest.send({
      name: 'chat.message',
      data: {
        message: 'Hello, this is a test message!',
        userId: 'test-user-id',
        roomId: 'test-room-id',
        senderName: 'Test User'
      }
    });
    console.log('Chat message event sent successfully!');
    
    // Test email notification event
    console.log('4. Sending email notification event...');
    await inngest.send({
      name: 'email/notification.send',
      data: {
        userId: 'test-user-id',
        email: 'test@example.com',
        subject: 'Test Email Notification',
        content: '<p>This is a test email notification</p>'
      }
    });
    console.log('Email notification event sent successfully!');
    
    console.log('All Inngest function tests completed!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testInngestFunctions();