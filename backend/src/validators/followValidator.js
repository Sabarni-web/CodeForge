import { body, param } from 'express-validator';

export const sendFollowValidator = [
  body('receiverId')
    .isMongoId()
    .withMessage('Invalid target user ID'),
];

export const requestIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid request ID'),
];

export const actionRequestValidator = [
  body('requestId')
    .isMongoId()
    .withMessage('Invalid request ID'),
];
