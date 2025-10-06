import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { broadcast } from './WebSocketService.js';
import inngest from '../utils/inngest.js';

class TaskService {
  // Create a new task
  static async createTask(taskData, userId) {
    const task = new Task({
      ...taskData,
      createdBy: userId,
      updatedBy: userId,
    });
    
    const savedTask = await task.save();
    
    // Broadcast task creation to WebSocket clients
    broadcast('taskCreated', { task: savedTask });
    
    // Trigger Inngest event for task creation
    try {
      await inngest.send({
        name: 'task.created',
        data: {
          task: savedTask.toObject(),
          userId
        }
      });
    } catch (error) {
      console.error('Failed to send task.created event to Inngest:', error);
    }
    
    return savedTask;
  }

  // Get all tasks for a project
  static async getTasksByProject(projectId, status = null) {
    const filter = { projectId };
    if (status) {
      filter.status = status;
    }
    
    return await Task.find(filter)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
  }

  // Get task by ID
  static async getTaskById(taskId) {
    return await Task.findById(taskId)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
  }

  // Update task
  static async updateTask(taskId, updateData, userId) {
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { 
        ...updateData,
        updatedBy: userId,
      },
      { new: true, runValidators: true }
    )
    .populate('assignee', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email');
    
    if (updatedTask) {
      // Broadcast task update to WebSocket clients
      broadcast('taskUpdated', { task: updatedTask });
      
      // Trigger Inngest event for task update
      try {
        await inngest.send({
          name: 'task.updated',
          data: {
            task: updatedTask.toObject(),
            userId
          }
        });
      } catch (error) {
        console.error('Failed to send task.updated event to Inngest:', error);
      }
    }
    
    return updatedTask;
  }

  // Delete task
  static async deleteTask(taskId) {
    const deletedTask = await Task.findByIdAndDelete(taskId);
    
    if (deletedTask) {
      // Broadcast task deletion to WebSocket clients
      broadcast('taskDeleted', { taskId });
      
      // Trigger Inngest event for task deletion
      try {
        await inngest.send({
          name: 'task.deleted',
          data: {
            taskId,
            task: deletedTask.toObject()
          }
        });
      } catch (error) {
        console.error('Failed to send task.deleted event to Inngest:', error);
      }
    }
    
    return deletedTask;
  }

  // Get tasks assigned to a user
  static async getUserTasks(userId) {
    return await Task.find({ assignee: userId })
      .populate('projectId', 'name')
      .populate('createdBy', 'firstName lastName email')
      .sort({ dueDate: 1 });
  }
  
  // Schedule deadline reminder
  static async scheduleDeadlineReminder(taskId, hoursBefore = 1) {
    const task = await Task.findById(taskId).populate('assignee', 'email');
    
    if (!task || !task.dueDate) {
      throw new Error('Task not found or no due date set');
    }
    
    const reminderTime = new Date(task.dueDate.getTime() - hoursBefore * 60 * 60 * 1000);
    
    if (reminderTime <= new Date()) {
      throw new Error('Reminder time is in the past');
    }
    
    // Trigger Inngest event to schedule reminder
    try {
      await inngest.send({
        name: 'task.deadline.reminder',
        data: {
          taskId: task._id,
          taskTitle: task.title,
          dueDate: task.dueDate,
          userId: task.assignee._id,
          recipientEmail: task.assignee.email
        },
        ts: reminderTime
      });
    } catch (error) {
      console.error('Failed to schedule deadline reminder:', error);
      throw error;
    }
    
    return { scheduledFor: reminderTime };
  }
}

export default TaskService;