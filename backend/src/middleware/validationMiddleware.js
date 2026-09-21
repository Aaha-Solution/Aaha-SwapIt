const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation Error', 422, errors.array());
  }
  next();
};

module.exports = validationMiddleware;
