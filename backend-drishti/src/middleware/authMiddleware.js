import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserModel } from '../models/userModel.js';

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to access this feature.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The account associated with this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Optional authentication: attaches user if token is present, continues as guest if not.
 * This guarantees blind users can test immediately without being blocked by a login wall!
 */
export const optionalAuth = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await UserModel.findById(decoded.id);
    req.user = user || null;
  } catch (err) {
    req.user = null;
  }
  next();
};
