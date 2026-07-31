import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';

/**
 * JWT authentication middleware
 * Reads token from httpOnly cookie, verifies it, and attaches req.user
 */
const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid token',
    });
  }
};

export default auth;
