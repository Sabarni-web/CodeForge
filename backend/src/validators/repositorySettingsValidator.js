import { body } from 'express-validator';

export const settingsUpdateValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Repository name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Repo name can only contain letters, numbers, dots, hyphens, and underscores'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array of strings'),

  body('website')
    .optional()
    .trim(),

  body('license')
    .optional()
    .trim(),

  body('defaultBranch')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Default branch name cannot be empty'),

  body('allowIssues')
    .optional()
    .isBoolean()
    .withMessage('allowIssues must be a boolean'),

  body('allowDiscussions')
    .optional()
    .isBoolean()
    .withMessage('allowDiscussions must be a boolean'),

  body('allowPullRequests')
    .optional()
    .isBoolean()
    .withMessage('allowPullRequests must be a boolean'),
];

export const visibilityUpdateValidator = [
  body('visibility')
    .trim()
    .notEmpty()
    .withMessage('Visibility is required')
    .isIn(['public', 'private'])
    .withMessage('Visibility must be public or private'),
];
