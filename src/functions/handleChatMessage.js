import inngest from '../utils/inngest.js';

// Inngest function for chat messages
const handleChatMessage = inngest.createFunction(
  { id: 'handle-chat-message' },
  { event: 'chat.message' },
  async ({ event, step }) => {
    const { message, userId, roomId, senderName } = event.data;
    
    // Log the chat message
    await step.run('log-chat-message', async () => {
      console.log(`Chat message in room ${roomId} from user ${userId}: ${message}`);
    });
    
    // If message mentions someone, send notification
    if (message.includes('@')) {
      await step.sleep('wait-before-notification', '2s');
      
      // Send notification to mentioned users
      await step.run('send-mention-notification', async () => {
        // Extract mentioned users from message
        const mentions = message.match(/@(\w+)/g) || [];
        console.log(`Sending notifications to mentioned users: ${mentions.join(', ')}`);
      });
    }
    
    return { success: true };
  }
);

export default handleChatMessage;