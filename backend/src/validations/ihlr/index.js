const { body } = require('express-validator');

const lineRejectionValidation = [
  body('part_number').notEmpty().withMessage('Part number is required'),
  body('line_name').notEmpty().withMessage('Line name is required'),
  body('rejection_qty').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
];

module.exports = {
  lineRejectionValidation
};
