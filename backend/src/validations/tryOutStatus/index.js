const { body } = require('express-validator');

const trialRunValidation = [
  body('tool_mold_number').notEmpty().withMessage('Tool/mold number is required'),
  body('component_name').notEmpty().withMessage('Component name is required')
];

module.exports = {
  trialRunValidation
};
