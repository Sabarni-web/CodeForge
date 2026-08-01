import { body } from 'express-validator';
import validate from '../middleware/validate.js';

export const forkValidationRules = () => {
  return [
    // Future expansion: maybe allow naming the fork differently
  ];
};

export const validateFork = validate(forkValidationRules());
