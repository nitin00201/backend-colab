import Project from '../models/Project.js';
import OrganizationService from './OrganizationService.js';

class ProjectService {
  // Create a new project
  static async createProject(projectData, userId) {
    const project = new Project({
      ...projectData,
      owner: userId,
      members: [{ user: userId, role: 'manager' }], // Use new structure with roles
    });
    
    const savedProject = await project.save();
    
    // Add project to organization if it exists
    if (projectData.organization) {
      await OrganizationService.addProject(projectData.organization, savedProject._id);
    }
    
    return savedProject;
  }

  // Get all projects for a user
  static async getUserProjects(userId) {
    return await Project.find({
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
    .populate('owner', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email')
    .populate('organization')
    .populate('team')
    .sort({ createdAt: -1 });
  }

  // Get all projects for an organization that the user is a member of
  static async getOrganizationProjects(organizationId, userId) {
    return await Project.find({
      organization: organizationId,
      $or: [
        { owner: userId },
        { 'members.user': userId }
      ]
    })
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate('organization')
      .populate('team')
      .sort({ createdAt: -1 });
  }

  // Get project by ID
  static async getProjectById(projectId) {
    return await Project.findById(projectId)
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate('organization')
      .populate('team');
  }

  // Update project
  static async updateProject(projectId, updateData) {
    // Prevent updating sensitive fields
    delete updateData.organization;
    delete updateData.owner;
    
    return await Project.findByIdAndUpdate(
      projectId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email')
    .populate('organization')
    .populate('team');
  }

  // Delete project
  static async deleteProject(projectId) {
    const project = await Project.findById(projectId);
    
    // Remove project from organization if it exists
    if (project.organization) {
      await OrganizationService.removeProject(project.organization, projectId);
    }
    
    return await Project.findByIdAndDelete(projectId);
  }

  // Add member to project
  static async addMember(projectId, userId, role = 'member') {
    return await Project.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: { user: userId, role } } },
      { new: true }
    )
    .populate('owner', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email')
    .populate('organization')
    .populate('team');
  }

  // Remove member from project
  static async removeMember(projectId, userId) {
    return await Project.findByIdAndUpdate(
      projectId,
      { $pull: { members: { user: userId } } },
      { new: true }
    )
    .populate('owner', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email')
    .populate('organization')
    .populate('team');
  }
}

export default ProjectService;