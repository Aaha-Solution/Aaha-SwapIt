const { errorResponse } = require('../utils/response');

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    const userRoles = req.user.roles || [req.user.role];
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
    }
    next();
  };
};

module.exports = roleMiddleware;
