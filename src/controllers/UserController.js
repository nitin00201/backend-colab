import UserService from '../services/UserService.js';

class UserController {
  // Get all users (admin only)
  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.findById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json({ user: userResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update user profile
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Prevent updating sensitive fields
      delete updateData.password;
      delete updateData.role;
      delete updateData.email;
      
      const user = await UserService.updateUser(id, updateData);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json({ user: userResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Delete user (admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.deleteUser(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Update user role (admin only)
  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      
      const user = await UserService.updateUserRole(id, role);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json({ user: userResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default UserController;