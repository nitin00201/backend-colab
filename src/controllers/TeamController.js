import TeamService from '../services/TeamService.js';
import OrganizationService from '../services/OrganizationService.js';
import logger from '../utils/logger.js';
import { sendTeamMemberAdditionNotification, sendInvitationEmail } from '../utils/emailService.js';
import User from '../models/User.js';

class TeamController {
  // Create a new team
  static async createTeam(req, res) {
    try {
      const teamData = req.body;
      const userId = req.user._id;
      
      // Check if user belongs to an organization
      if (!req.user.organization) {
        return res.status(400).json({ error: 'User must belong to an organization to create a team' });
      }
      
      const team = await TeamService.createTeam(teamData, req.user.organization);
      
      // Add creator as team lead
      await TeamService.addMember(team._id, userId, 'lead');
      
      // Populate the response
      const populatedTeam = await TeamService.getTeamById(team._id);
      
      res.status(201).json({ team: populatedTeam });
    } catch (error) {
      logger.error('Error creating team:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get team by ID
  static async getTeamById(req, res) {
    try {
      const { id } = req.params;
      
      const team = await TeamService.getTeamById(id);
      
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      res.json({ team });
    } catch (error) {
      logger.error('Error fetching team:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get teams by organization
  static async getTeamsByOrganization(req, res) {
    try {
      const organizationId = req.user.organization;
      
      if (!organizationId) {
        return res.status(400).json({ error: 'User is not part of any organization' });
      }
      
      const teams = await TeamService.getTeamsByOrganization(organizationId);
      
      res.json({ teams });
    } catch (error) {
      logger.error('Error fetching teams:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Add member to team
  static async addMember(req, res) {
    try {
      const { id: teamId } = req.params;
      const { userId, role, email } = req.body; // Accept email as an alternative to userId
      
      // Check if user has permission to add members
      const team = await TeamService.getTeamById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Check if user belongs to the same organization
      if (team.organization.toString() !== req.user.organization.toString()) {
        return res.status(403).json({ error: 'Team does not belong to your organization' });
      }
      
      const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (req.user.role !== 'admin' && !isTeamLead) {
        return res.status(403).json({ error: 'Insufficient permissions to add members' });
      }
      
      // If we have an email but no userId, send an invitation
      if (email && !userId) {
        try {
          // Check if user already exists with this email
          const existingUser = await User.findOne({ email });
          
          if (existingUser) {
            // If user exists, add them normally
            const updatedTeam = await TeamService.addMember(teamId, existingUser._id, role);
            
            // Send email notification to the added member
            try {
              const addingUser = req.user;
              await sendTeamMemberAdditionNotification({
                userId: existingUser._id,
                teamId: teamId,
                teamName: team.name,
                addedByName: `${addingUser.firstName} ${addingUser.lastName}`,
                recipientEmail: existingUser.email,
                role: role
              });
            } catch (emailError) {
              logger.error('Error sending team member addition email:', emailError);
            }
            
            return res.json({ team: updatedTeam, message: 'Member added successfully' });
          } else {
            // If user doesn't exist, send invitation email
            const addingUser = req.user;
            const registerUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?invite=${encodeURIComponent(email)}&team=${teamId}&role=${role}`;
            
            await sendInvitationEmail({
              inviteeEmail: email,
              inviterName: `${addingUser.firstName} ${addingUser.lastName}`,
              organizationName: team.organization.name,
              teamName: team.name,
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
        const updatedTeam = await TeamService.addMember(teamId, userId, role);
        
        // Send email notification to the added member
        try {
          const addedUser = await User.findById(userId);
          const addingUser = req.user;
          
          if (addedUser && addedUser.email) {
            await sendTeamMemberAdditionNotification({
              userId: userId,
              teamId: teamId,
              teamName: team.name,
              addedByName: `${addingUser.firstName} ${addingUser.lastName}`,
              recipientEmail: addedUser.email,
              role: role
            });
          }
        } catch (emailError) {
          logger.error('Error sending team member addition email:', emailError);
          // Don't fail the request if email sending fails
        }
        
        return res.json({ team: updatedTeam });
      }
      
      return res.status(400).json({ error: 'Either userId or email must be provided' });
    } catch (error) {
      logger.error('Error adding member to team:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Remove member from team
  static async removeMember(req, res) {
    try {
      const { id: teamId } = req.params;
      const { userId } = req.body;
      
      // Check if user has permission to remove members
      const team = await TeamService.getTeamById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Check if user belongs to the same organization
      if (team.organization.toString() !== req.user.organization.toString()) {
        return res.status(403).json({ error: 'Team does not belong to your organization' });
      }
      
      const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (req.user.role !== 'admin' && !isTeamLead) {
        return res.status(403).json({ error: 'Insufficient permissions to remove members' });
      }
      
      // Prevent removing team lead by non-admins
      const memberToRemove = team.members.find(member => 
        member.user.toString() === userId
      );
      
      if (memberToRemove && memberToRemove.role === 'lead' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can remove team leads' });
      }
      
      const updatedTeam = await TeamService.removeMember(teamId, userId);
      
      res.json({ team: updatedTeam });
    } catch (error) {
      logger.error('Error removing member from team:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update member role in team
  static async updateMemberRole(req, res) {
    try {
      const { id: teamId } = req.params;
      const { userId, role } = req.body;
      
      // Check if user has permission to update member roles
      const team = await TeamService.getTeamById(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Check if user belongs to the same organization
      if (team.organization.toString() !== req.user.organization.toString()) {
        return res.status(403).json({ error: 'Team does not belong to your organization' });
      }
      
      const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (req.user.role !== 'admin' && !isTeamLead) {
        return res.status(403).json({ error: 'Insufficient permissions to update member roles' });
      }
      
      // Prevent changing team lead role by non-admins
      const memberToUpdate = team.members.find(member => 
        member.user.toString() === userId
      );
      
      if (memberToUpdate && memberToUpdate.role === 'lead' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admins can change team lead roles' });
      }
      
      const updatedTeam = await TeamService.updateMemberRole(teamId, userId, role);
      
      res.json({ team: updatedTeam });
    } catch (error) {
      logger.error('Error updating member role:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get all teams (admin only)
  static async getAllTeams(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      const teams = await TeamService.getAllTeams();
      
      res.json({ teams });
    } catch (error) {
      logger.error('Error fetching teams:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update team
  static async updateTeam(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if user has permission to update team
      const team = await TeamService.getTeamById(id);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Check if user belongs to the same organization
      if (team.organization.toString() !== req.user.organization.toString()) {
        return res.status(403).json({ error: 'Team does not belong to your organization' });
      }
      
      const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (req.user.role !== 'admin' && !isTeamLead) {
        return res.status(403).json({ error: 'Insufficient permissions to update team' });
      }
      
      // Prevent updating sensitive fields
      delete updateData.organization;
      delete updateData.members;
      delete updateData.projects;
      
      const updatedTeam = await TeamService.updateTeam(id, updateData);
      
      res.json({ team: updatedTeam });
    } catch (error) {
      logger.error('Error updating team:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Delete team
  static async deleteTeam(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user has permission to delete team
      const team = await TeamService.getTeamById(id);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      // Check if user belongs to the same organization
      if (team.organization.toString() !== req.user.organization.toString()) {
        return res.status(403).json({ error: 'Team does not belong to your organization' });
      }
      
      const isTeamLead = team.members.some(member => 
        member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (req.user.role !== 'admin' && !isTeamLead) {
        return res.status(403).json({ error: 'Insufficient permissions to delete team' });
      }
      
      await TeamService.deleteTeam(id);
      
      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      logger.error('Error deleting team:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get all team members (legacy method for backward compatibility)
  static async getTeamMembers(req, res) {
    try {
      const members = await TeamService.getAllTeamMembers();
      res.json({ members });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update team member (legacy method for backward compatibility)
  static async updateTeamMember(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if the user has permission to update team members
      if (req.user.role !== 'manager' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions to update team members' });
      }
      
      // Prevent updating sensitive fields
      delete updateData.password;
      delete updateData.email;
      
      // Only admins can update roles
      if (updateData.role && req.user.role !== 'admin') {
        delete updateData.role;
      }
      
      const member = await TeamService.updateTeamMember(id, updateData);
      
      if (!member) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      
      // Remove password from response
      const memberResponse = member.toObject();
      delete memberResponse.password;
      
      res.json({ member: memberResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Delete team member (legacy method for backward compatibility)
  static async deleteTeamMember(req, res) {
    try {
      const { id } = req.params;
      
      // Check if the user has permission to delete team members
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions to delete team members' });
      }
      
      const member = await TeamService.deleteTeamMember(id);
      
      if (!member) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      
      res.json({ message: 'Team member deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get all members of a team
  static async getTeamMembersById(req, res) {
    try {
      const { id } = req.params;
      
      const team = await TeamService.getTeamById(id);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
      
      res.json({ members: team.members });
    } catch (error) {
      logger.error('Error fetching team members:', error);
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update user role (legacy method for backward compatibility)
  static async updateTeamMemberRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      // Check if the user has permission to update roles
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions to update user roles' });
      }
      
      const member = await TeamService.updateTeamMemberRole(id, role);
      
      if (!member) {
        return res.status(404).json({ error: 'Team member not found' });
      }
      
      // Remove password from response
      const memberResponse = member.toObject();
      delete memberResponse.password;
      
      res.json({ member: memberResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default TeamController;