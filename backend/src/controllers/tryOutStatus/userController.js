const userService = require('../../services/tryOutStatus/userService');
const { successResponse } = require('../../utils/response');

const userController = {
  async getToolingEngineers(req, res, next) {
    try {
      const users = await userService.getToolingEngineers();
      return successResponse(res, users, 'Tooling engineers retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;
