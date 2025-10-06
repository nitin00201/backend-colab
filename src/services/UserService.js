import User from '../models/User.js';

class UserService {
  // Create a new user
  static async createUser(userData) {
    const user = new User(userData);
    return await user.save();
  }

  // Find user by email
  static async findByEmail(email) {
    return await User.findOne({ email }).populate('organization').populate('teams');
  }

  // Find user by ID
  static async findById(id) {
    return await User.findById(id).populate('organization').populate('teams');
  }

  // Update user profile
  static async updateUser(userId, updateData) {
    // Prevent updating sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.organization;
    delete updateData.teams;
    
    return await User.findByIdAndUpdate(userId, updateData, { new: true })
      .populate('organization')
      .populate('teams');
  }

  // Get all users
  static async getAllUsers() {
    return await User.find({ isActive: true }, '-password')
      .populate('organization')
      .populate('teams')
      .sort({ firstName: 1, lastName: 1 });
  }

  // Delete user
  static async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  // Update user role
  static async updateUserRole(userId, role) {
    return await User.findByIdAndUpdate(userId, { role }, { new: true })
      .populate('organization')
      .populate('teams');
  }
}

export default UserService;