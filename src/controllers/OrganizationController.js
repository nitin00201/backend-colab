import OrganizationService from '../services/OrganizationService.js';
import logger from '../utils/logger.js';
import { sendInvitationEmail } from '../utils/emailService.js';
import User from '../models/User.js';

class OrganizationController {
  // Create a new organization
  static async createOrganization(req, res) {
    try {
      const organizationData = req.body;
      const ownerId = req.user._id;
      
      const organization = await OrganizationService.createOrganization(organizationData, ownerId);
      
      res.status(201).json({ organization });
    } catch (error) {
      logger.error('Error creating organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get organization by ID
  static async getOrganizationById(req, res) {
    try {
      const { id } = req.params;
      
      const organization = await OrganizationService.getOrganizationById(id);
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      res.json({ organization });
    } catch (error) {
      logger.error('Error fetching organization:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Join organization
  static async joinOrganization(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      // Check if organization exists
      const organization = await OrganizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      // Check if user is already a member
      const isMember = organization.members.some(member => 
        member.user.toString() === userId.toString()
      );
      
      if (isMember) {
        return res.status(400).json({ error: 'You are already a member of this organization' });
      }
      
      // Add user as a member with default role
      const updatedOrganization = await OrganizationService.addMember(id, userId, 'member');
      
      // Update user with organization reference
      await User.findByIdAndUpdate(userId, { 
        organization: id 
      });
      
      res.json({ 
        message: 'Successfully joined organization',
        organization: updatedOrganization 
      });
    } catch (error) {
      logger.error('Error joining organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get user's organization
  static async getUserOrganization(req, res) {
    try {
      const userId = req.user._id;
      
      // First check if user has an organization
      if (!req.user.organization) {
        return res.status(404).json({ error: 'User is not part of any organization' });
      }
      
      const organization = await OrganizationService.getOrganizationById(req.user.organization);
      
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      res.json({ organization });
    } catch (error) {
      logger.error('Error fetching user organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Add member to organization
  static async addMember(req, res) {
    try {
      const { id: organizationId } = req.params;
      const { userId, role, email } = req.body; // Accept email as an alternative to userId
      
      // Check if user has permission to add members
      const organization = await OrganizationService.getOrganizationById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      const isOwner = organization.owner.toString() === req.user._id.toString();
      const isAdmin = organization.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'admin'
      );
      
    
      
      // If we have an email but no userId, send an invitation
      if (email && !userId) {
        try {
          // Check if user already exists with this email
          const existingUser = await User.findOne({ email });
          
          if (existingUser) {
            // If user exists, add them normally
            const updatedOrganization = await OrganizationService.addMember(organizationId, existingUser._id, role);
            return res.json({ organization: updatedOrganization, message: 'Member added successfully' });
          } else {
            // If user doesn't exist, send invitation email
            const addingUser = req.user;
            const registerUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${encodeURIComponent(email)}&organization=${organizationId}&role=${role}`;
            
            await sendInvitationEmail({
              inviteeEmail: email,
              inviterName: `${addingUser.firstName} ${addingUser.lastName}`,
              organizationName: organization.name,
              teamName: null,
              role: role,
              registerUrl: registerUrl
            });
            
            return res.json({ 
              message: 'Invitation sent successfully', 
              invited: true,
              email: email
            });
          }
        } catch (invitationError) {
          logger.error('Error sending invitation email:', invitationError);
          return res.status(500).json({ error: 'Failed to send invitation' });
        }
      }
      
      // If we have a userId, proceed with normal member addition
      if (userId) {
        const updatedOrganization = await OrganizationService.addMember(organizationId, userId, role);
        return res.json({ organization: updatedOrganization });
      }
      
      return res.status(400).json({ error: 'Either userId or email must be provided' });
    } catch (error) {
      logger.error('Error adding member to organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Remove member from organization
  static async removeMember(req, res) {
    try {
      const { id: organizationId } = req.params;
      const { userId } = req.body;
      
      // Check if user has permission to remove members
      const organization = await OrganizationService.getOrganizationById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      const isOwner = organization.owner.toString() === req.user._id.toString();
      const isAdmin = organization.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'admin'
      );
      const isSelfRemoval = req.user._id.toString() === userId;
      
      // Allow admins/owners to remove members or users to leave themselves
    
      
      // Prevent removing the owner
      if (organization.owner.toString() === userId) {
        return res.status(400).json({ error: 'Cannot remove the organization owner' });
      }
      
      const updatedOrganization = await OrganizationService.removeMember(organizationId, userId);
      
      res.json({ organization: updatedOrganization });
    } catch (error) {
      logger.error('Error removing member from organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update member role
  static async updateMemberRole(req, res) {
    try {
      const { id: organizationId } = req.params;
      const { userId, role } = req.body;
      
      // Check if user has permission to update member roles
      const organization = await OrganizationService.getOrganizationById(organizationId);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      const isOwner = organization.owner.toString() === req.user._id.toString();
      const isAdmin = organization.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'admin'
      );
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions to update member roles' });
      }
      
      // Prevent changing the owner's role
      if (organization.owner.toString() === userId) {
        return res.status(400).json({ error: 'Cannot change the organization owner role' });
      }
      
      const updatedOrganization = await OrganizationService.updateMemberRole(organizationId, userId, role);
      
      res.json({ organization: updatedOrganization });
    } catch (error) {
      logger.error('Error updating member role:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get all organizations (admin only)
  static async getAllOrganizations(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      const organizations = await OrganizationService.getAllOrganizations();
      
      res.json({ organizations });
    } catch (error) {
      logger.error('Error fetching organizations:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update organization
  static async updateOrganization(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if user has permission to update organization
      const organization = await OrganizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      const isOwner = organization.owner.toString() === req.user._id.toString();
      const isAdmin = organization.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'admin'
      );
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Insufficient permissions to update organization' });
      }
      
      // Prevent updating sensitive fields
      delete updateData.owner;
      delete updateData.members;
      delete updateData.teams;
      delete updateData.projects;
      
      const updatedOrganization = await OrganizationService.updateOrganization(id, updateData);
      
      res.json({ organization: updatedOrganization });
    } catch (error) {
      logger.error('Error updating organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Delete organization
  static async deleteOrganization(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user has permission to delete organization
      const organization = await OrganizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      if (organization.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Insufficient permissions to delete organization' });
      }
      
      await OrganizationService.deleteOrganization(id);
      
      res.json({ message: 'Organization deleted successfully' });
    } catch (error) {
      logger.error('Error deleting organization:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get all members of an organization
  static async getOrganizationMembers(req, res) {
    try {
      const { id } = req.params;
      
      const organization = await OrganizationService.getOrganizationById(id);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      
      res.json({ members: organization.members });
    } catch (error) {
      logger.error('Error fetching organization members:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default OrganizationController;