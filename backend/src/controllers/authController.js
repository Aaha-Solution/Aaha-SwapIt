const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

const authController = {
  async login(req, res, next) {
    try {
      const { emailOrPhone, password } = req.body;
      const result = await authService.login(emailOrPhone, password);
      return successResponse(res, result, 'Logged in successfully');
    } catch (err) {
      return errorResponse(res, err.message, 401);
    }
  },

  async signup(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, 'Registration successful', 201);
    } catch (err) {
      return errorResponse(res, err.message, 400);
    }
  },

  async getMe(req, res, next) {
    try {
      return successResponse(res, req.user, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  },

  async logout(req, res, next) {
    return successResponse(res, null, 'Logged out successfully');
  }
};

module.exports = authController;
