import inngest from '../utils/inngest.js';

// Inngest function for task creation
const handleTaskCreated = inngest.createFunction(
  { id: 'handle-task-created' },
  { event: 'task.created' },
  async ({ event, step }) => {
    const { task, userId } = event.data;
    
    // Log the task creation
    await step.run('log-task-creation', async () => {
      console.log(`Task created: ${task.title} by user ${userId}`);
    });
    
    // If the task has a due date, schedule a reminder
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const reminderTime = new Date(dueDate.getTime() - 60 * 60 * 1000); // 1 hour before due date
      
      if (reminderTime > new Date()) {
        await step.sleepUntil('wait-for-reminder', reminderTime);
        
        // Send reminder email
        await step.run('send-reminder', async () => {
          // In a real implementation, you would trigger an email notification event
          console.log(`Sending reminder for task: ${task.title}`);
        });
      }
    }
    
    return { success: true };
  }
);

export default handleTaskCreated;