import jwt from 'jsonwebtoken';
import config from '../config/index.js';

class AuthService {
  // Generate access token
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
  }

  // Generate refresh token
  static generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  // Verify access token
  static verifyAccessToken(token) {
    return jwt.verify(token, config.jwt.accessSecret);
  }

  // Verify refresh token
  static verifyRefreshToken(token) {
    return jwt.verify(token, config.jwt.refreshSecret);
  }

  // Check if user has required role
  static hasRole(user, requiredRole) {
    const roles = ['member', 'manager', 'admin'];
    return roles.indexOf(user.role) >= roles.indexOf(requiredRole);
  }
}

export default AuthService;