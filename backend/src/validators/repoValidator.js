import { body, param } from 'express-validator';

export const createRepoValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Repository name is required')
    .isLength({ max: 100 })
    .withMessage('Repository name cannot exceed 100 characters')
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage('Repo name can only contain letters, numbers, dots, hyphens, and underscores'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean'),
];

export const repoIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid repository ID'),
];
