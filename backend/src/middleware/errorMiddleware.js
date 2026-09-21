const { errorResponse } = require('../utils/response');
const config = require('../config/env');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error Caught]:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    message,
    statusCode,
    config.nodeEnv === 'development' ? { stack: err.stack } : null
  );
};

module.exports = {
  notFoundHandler,
  globalErrorHandler
};
