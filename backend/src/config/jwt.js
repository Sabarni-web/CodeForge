import jwt from 'jsonwebtoken';

/**
 * Sign a JWT token with the user's ID
 * @param {string} userId - MongoDB ObjectId as string
 * @returns {string} signed JWT token
 */
export const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Verify a JWT token and return the decoded payload
 * @param {string} token - JWT token string
 * @returns {object} decoded payload { id, iat, exp }
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
