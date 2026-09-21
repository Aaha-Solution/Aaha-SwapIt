const userService = require('../../services/ihlr/userService');
const { successResponse } = require('../../utils/response');

const userController = {
  async getEngineers(req, res, next) {
    try {
      const engineers = await userService.getLineEngineers();
      return successResponse(res, engineers, 'Line engineers retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;
