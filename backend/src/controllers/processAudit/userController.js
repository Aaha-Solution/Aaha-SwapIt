const userService = require('../../services/processAudit/userService');
const { successResponse } = require('../../utils/response');

const userController = {
  async getAuditors(req, res, next) {
    try {
      const auditors = await userService.getAuditors();
      return successResponse(res, auditors, 'Auditors retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = userController;
