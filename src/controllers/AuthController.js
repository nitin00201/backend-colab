import UserService from '../services/UserService.js';
import AuthService from '../services/AuthService.js';

class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await UserService.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Create new user
      const user = await UserService.createUser({
        email,
        password,
        firstName,
        lastName,
      });
      
      // Generate tokens
      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.status(201).json({
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // User login
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await UserService.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Update last login
      user.lastLogin = new Date();
      await user.save();
      
      // Generate tokens
      const accessToken = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);
      
      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      
      res.json({
        user: userResponse,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }
      
      try {
        const decoded = AuthService.verifyRefreshToken(refreshToken);
        const user = await UserService.findById(decoded.id);
        
        if (!user) {
          return res.status(401).json({ error: 'Invalid refresh token' });
        }
        
        // Generate new tokens
        const newAccessToken = AuthService.generateAccessToken(user);
        const newRefreshToken = AuthService.generateRefreshToken(user);
        
        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json({
          user: userResponse,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      } catch (error) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await UserService.findById(req.user.id);
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

export default AuthController;