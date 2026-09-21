const { body } = require('express-validator');

const createRequestValidation = [
  body('department').notEmpty().withMessage('Department is required'),
  body('audit_type').notEmpty().withMessage('Audit type is required')
];

module.exports = {
  createRequestValidation
};
