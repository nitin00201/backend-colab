import Team from '../models/Team.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

class TeamService {
  // Create a new team
  static async createTeam(teamData, organizationId) {
    const team = new Team({
      ...teamData,
      organization: organizationId
    });
    
    const savedTeam = await team.save();
    
    // Add team to organization
    await Organization.findByIdAndUpdate(organizationId, {
      $addToSet: { teams: savedTeam._id }
    });
    
    return savedTeam;
  }

  // Get team by ID
  static async getTeamById(teamId) {
    return await Team.findById(teamId)
      .populate('organization')
      .populate('members.user', 'firstName lastName email role')
      .populate('projects');
  }

  // Get teams by organization
  static async getTeamsByOrganization(organizationId) {
    return await Team.find({ organization: organizationId })
      .populate('members.user', 'firstName lastName email role')
      .populate('projects');
  }

  // Add member to team
  static async addMember(teamId, userId, role = 'member') {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user is already a member
    const isMember = team.members.some(member => 
      member.user.toString() === userId.toString()
    );

    if (!isMember) {
      team.members.push({
        user: userId,
        role
      });
      
      // Add team to user's teams array
      await User.findByIdAndUpdate(userId, {
        $addToSet: { teams: teamId }
      });
      
      await team.save();
    }

    return team;
  }

  // Remove member from team
  static async removeMember(teamId, userId) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    team.members = team.members.filter(member => 
      member.user.toString() !== userId.toString()
    );
    
    // Remove team from user's teams array
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: teamId }
    });
    
    await team.save();
    
    return team;
  }

  // Update member role in team
  static async updateMemberRole(teamId, userId, role) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    const member = team.members.find(member => 
      member.user.toString() === userId.toString()
    );

    if (member) {
      member.role = role;
      await team.save();
    }

    return team;
  }

  // Add project to team
  static async addProject(teamId, projectId) {
    const team = await Team.findByIdAndUpdate(
      teamId,
      { $addToSet: { projects: projectId } },
      { new: true }
    );
    
    // Also add project to organization
    if (team) {
      await Organization.findByIdAndUpdate(
        team.organization,
        { $addToSet: { projects: projectId } }
      );
    }
    
    return team;
  }

  // Remove project from team
  static async removeProject(teamId, projectId) {
    return await Team.findByIdAndUpdate(
      teamId,
      { $pull: { projects: projectId } },
      { new: true }
    );
  }

  // Get all teams
  static async getAllTeams() {
    return await Team.find()
      .populate('organization')
      .populate('members.user', 'firstName lastName email role')
      .populate('projects');
  }

  // Update team
  static async updateTeam(teamId, updateData) {
    return await Team.findByIdAndUpdate(
      teamId,
      updateData,
      { new: true }
    )
    .populate('organization')
    .populate('members.user', 'firstName lastName email role')
    .populate('projects');
  }

  // Delete team
  static async deleteTeam(teamId) {
    const team = await Team.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Remove team reference from organization
    await Organization.findByIdAndUpdate(
      team.organization,
      { $pull: { teams: teamId } }
    );
    
    // Remove team reference from all users
    await User.updateMany(
      { teams: teamId },
      { $pull: { teams: teamId } }
    );
    
    return await Team.findByIdAndDelete(teamId);
  }
  
  // Get all team members (legacy method for backward compatibility)
  static async getAllTeamMembers() {
    return await User.find({ isActive: true }, '-password').sort({ firstName: 1, lastName: 1 });
  }

  // Update team member profile (legacy method for backward compatibility)
  static async updateTeamMember(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }

  // Delete team member (legacy method for backward compatibility)
  static async deleteTeamMember(userId) {
    // We'll just deactivate the user instead of deleting them
    return await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
  }

  // Update team member role (legacy method for backward compatibility)
  static async updateTeamMemberRole(userId, role) {
    return await User.findByIdAndUpdate(userId, { role }, { new: true });
  }
  
  // Get team members by project (legacy method for backward compatibility)
  static async getTeamMembersByProject(projectId) {
    // This would be implemented if we had project-specific team management
    // For now, we'll return all active team members
    return await User.find({ isActive: true }, '-password').sort({ firstName: 1, lastName: 1 });
  }
}

export default TeamService;