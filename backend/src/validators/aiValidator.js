import { body } from 'express-validator';

export const generateSiteValidator = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Prompt must be between 10 and 5000 characters'),
];
