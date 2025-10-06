import ProjectService from '../services/ProjectService.js';
import { sendEmail } from '../utils/emailService.js';
import { initializeNotificationService } from '../services/NotificationService.js';
import User from '../models/User.js';

// Initialize notification service
const notificationService = initializeNotificationService();

// Create a new project
const createProject = async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      organization: req.user.organization, // Set organization from user
      owner: req.user.id // Keep owner for backward compatibility
    };
    
    const project = await ProjectService.createProject(projectData, req.user.id);
    res.status(201).json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all projects for current user's organization
const getUserProjects = async (req, res) => {
  try {
    // If user belongs to an organization, get projects for that organization
    if (req.user.organization) {
      const projects = await ProjectService.getOrganizationProjects(req.user.organization, req.user.id);
      res.json({ projects });
    } else {
      // Fallback to user projects for backward compatibility
      const projects = await ProjectService.getUserProjects(req.user.id);
      res.json({ projects });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user has access to the project
    const isMember = project.members.some(member => member.user.toString() === req.user.id) || 
                     project.owner.toString() === req.user.id ||
                     (project.organization && req.user.organization && 
                      project.organization.toString() === req.user.organization.toString());
    
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied to this project' });
    }
    
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is the owner or belongs to the organization
    const isOwner = project.owner.toString() === req.user.id;
    const isInOrganization = project.organization && req.user.organization && 
                            project.organization.toString() === req.user.organization.toString();
    
    if (!isOwner && !isInOrganization) {
      return res.status(403).json({ error: 'Permission denied to update this project' });
    }
    
    const updatedProject = await ProjectService.updateProject(projectId, req.body);
    res.json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is the owner or belongs to the organization
    const isOwner = project.owner.toString() === req.user.id;
    const isInOrganization = project.organization && req.user.organization && 
                            project.organization.toString() === req.user.organization.toString();
    
    if (!isOwner && !isInOrganization) {
      return res.status(403).json({ error: 'Permission denied to delete this project' });
    }
    
    await ProjectService.deleteProject(projectId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add member to project
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is the owner or belongs to the organization
    const isOwner = project.owner.toString() === req.user.id;
    const isInOrganization = project.organization && req.user.organization && 
                            project.organization.toString() === req.user.organization.toString();
    
    if (!isOwner && !isInOrganization) {
      return res.status(403).json({ error: 'Permission denied to add members to this project' });
    }
    
    const updatedProject = await ProjectService.addMember(projectId, userId, role);
    
    // Send notification and email to the added member
    try {
      const memberUser = await User.findById(userId);
      if (memberUser && memberUser.email) {
        // Create in-app notification
        await notificationService.createNotification(
          userId,
          'project_invitation',
          `You've been added to project: ${project.name}`,
          {
            projectId: project._id,
            projectName: project.name,
            role,
            addedBy: req.user.firstName + ' ' + req.user.lastName
          }
        );
        
        // Send email notification
        const subject = `You've been added to project: ${project.name}`;
        const html = `
          <h2>Project Invitation</h2>
          <p>You have been added to a project:</p>
          <ul>
            <li><strong>Project:</strong> ${project.name}</li>
            <li><strong>Added by:</strong> ${req.user.firstName} ${req.user.lastName}</li>
            <li><strong>Role:</strong> ${role}</li>
          </ul>
          <p>You can now collaborate on this project.</p>
        `;
        
        await sendEmail({
          to: memberUser.email,
          subject,
          html
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification/email:', notificationError);
      // Don't fail the request if notification fails
    }
    
    res.json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove member from project
const removeMember = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    
    const project = await ProjectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user is the owner or belongs to the organization
    const isOwner = project.owner.toString() === req.user.id;
    const isInOrganization = project.organization && req.user.organization && 
                            project.organization.toString() === req.user.organization.toString();
    
    if (!isOwner && !isInOrganization) {
      return res.status(403).json({ error: 'Permission denied to remove members from this project' });
    }
    
    // Prevent owner from removing themselves
    if (project.owner.toString() === userId) {
      return res.status(400).json({ error: 'Cannot remove project owner' });
    }
    
    const updatedProject = await ProjectService.removeMember(projectId, userId);
    res.json({ project: updatedProject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};