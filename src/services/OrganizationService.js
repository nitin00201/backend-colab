import Organization from '../models/Organization.js';
import User from '../models/User.js';

class OrganizationService {
  // Create a new organization
  static async createOrganization(organizationData, ownerId) {
    const organization = new Organization({
      ...organizationData,
      owner: ownerId,
      members: [{
        user: ownerId,
        role: 'admin'
      }]
    });
    
    const savedOrganization = await organization.save();
    
    // Update user with organization reference
    await User.findByIdAndUpdate(ownerId, { 
      organization: savedOrganization._id 
    });
    
    return savedOrganization;
  }

  // Get organization by ID
  static async getOrganizationById(organizationId) {
    return await Organization.findById(organizationId)
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role')
      .populate('teams')
      .populate('projects');
  }

  // Get organization by owner
  static async getOrganizationByOwner(ownerId) {
    return await Organization.findOne({ owner: ownerId })
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role')
      .populate('teams')
      .populate('projects');
  }

  // Add member to organization
  static async addMember(organizationId, userId, role = 'member') {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if user is already a member
    const isMember = organization.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (!isMember) {
      organization.members.push({
        user: userId,
        role
      });
      
      // Update user with organization reference
      await User.findByIdAndUpdate(userId, { 
        organization: organizationId 
      });
      
      await organization.save();
    }

    return organization;
  }

  // Remove member from organization
  static async removeMember(organizationId, userId) {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    organization.members = organization.members.filter(member => 
      member.user.toString() !== userId.toString()
    );
    
    // Remove organization reference from user
    await User.findByIdAndUpdate(userId, { 
      $unset: { organization: "" } 
    });
    
    await organization.save();
    
    return organization;
  }

  // Update member role
  static async updateMemberRole(organizationId, userId, role) {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new Error('Organization not found');
    }

    const member = organization.members.find(member => 
      member.user.toString() === userId.toString()
    );

    if (member) {
      member.role = role;
      await organization.save();
    }

    return organization;
  }

  // Add team to organization
  static async addTeam(organizationId, teamId) {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $addToSet: { teams: teamId } },
      { new: true }
    );
  }

  // Remove team from organization
  static async removeTeam(organizationId, teamId) {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { teams: teamId } },
      { new: true }
    );
  }

  // Add project to organization
  static async addProject(organizationId, projectId) {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $addToSet: { projects: projectId } },
      { new: true }
    );
  }

  // Remove project from organization
  static async removeProject(organizationId, projectId) {
    return await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { projects: projectId } },
      { new: true }
    );
  }

  // Get all organizations
  static async getAllOrganizations() {
    return await Organization.find()
      .populate('owner', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email role')
      .populate('teams')
      .populate('projects');
  }

  // Update organization
  static async updateOrganization(organizationId, updateData) {
    return await Organization.findByIdAndUpdate(
      organizationId,
      updateData,
      { new: true }
    )
    .populate('owner', 'firstName lastName email')
    .populate('members.user', 'firstName lastName email role')
    .populate('teams')
    .populate('projects');
  }

  // Delete organization
  static async deleteOrganization(organizationId) {
    return await Organization.findByIdAndDelete(organizationId);
  }
}

export default OrganizationService;