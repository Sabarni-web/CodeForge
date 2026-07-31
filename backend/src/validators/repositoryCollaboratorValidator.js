import { body } from 'express-validator';

export const inviteValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Owner', 'Maintainer', 'Contributor', 'Viewer'])
    .withMessage('Invalid collaborator role'),
];

export const transferValidator = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Invalid username format'),
];
