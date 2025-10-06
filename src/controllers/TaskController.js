import TaskService from '../services/TaskService.js';
import ProjectService from '../services/ProjectService.js';

// Create a new task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.body;
    
    // Log the projectId to ensure it's coming in as expected
    console.log('Received projectId:', projectId);
    
    // Check if project exists and user has access
    const project = await ProjectService.getProjectById(projectId);
    console.log('Project found:', project); // Log the project object

    if (!project) {
      console.log('Project not found'); // Log the error before sending response
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is a member of the project or owner
    const isMember = project.members.some(member => member.user._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    console.log('Is user a member or owner:', isMember); // Log if user has access to the project

    if (!isMember) {
      console.log('Access denied to user:', req.user.id); // Log who is being denied access
      return res.status(403).json({ error: 'Access denied to this project' });
    }
    
    // Create the task
    const task = await TaskService.createTask(req.body, req.user.id);
    console.log('Task created:', task); // Log the created task object
    
    // Respond with the created task
    res.status(201).json({ task });
  } catch (error) {
    console.error('Error in createTask:', error); // Log the error message
    res.status(500).json({ error: error.message });
  }
};


// Get all tasks for a project
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;
    
    // Check if project exists and user has access
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is member of the project
    const isMember = project.members.some(member => member.user?._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }
    
    const tasks = await TaskService.getTasksByProject(projectId, status);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user has access to the project
    const project = await ProjectService.getProjectById(task.projectId);
    const isMember = project.members.some(member => member._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }
    
    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user has access to the project
    const project = await ProjectService.getProjectById(task.projectId);
    const isMember = project.members.some(member => member._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }
    
    // Check if user is the assignee, creator, or project owner
    const canEdit = task.assignee?._id.toString() === req.user.id || 
                    task.createdBy._id.toString() === req.user.id ||
                    project.owner._id.toString() === req.user.id;
    
    if (!canEdit) {
      return res.status(403).json({ error: 'Permission denied to update this task' });
    }
    
    const updatedTask = await TaskService.updateTask(taskId, req.body, req.user.id);
    res.json({ task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if user has access to the project
    const project = await ProjectService.getProjectById(task.projectId);
    const isMember = project.members.some(member => member._id.toString() === req.user.id) || 
                     project.owner._id.toString() === req.user.id;
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this task' });
    }
    
    // Check if user is the creator or project owner
    const canDelete = task.createdBy._id.toString() === req.user.id ||
                      project.owner._id.toString() === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Permission denied to delete this task' });
    }
    
    await TaskService.deleteTask(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get tasks assigned to current user
const getUserTasks = async (req, res) => {
  try {
    const tasks = await TaskService.getUserTasks(req.user.id);
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getUserTasks,
};