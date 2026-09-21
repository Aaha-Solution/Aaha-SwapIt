const notificationService = require('../../services/tryOutStatus/notificationService');
const { successResponse } = require('../../utils/response');

const notificationController = {
  async list(req, res, next) {
    try {
      const list = await notificationService.getTryOutNotifications(req.user ? req.user.id : null);
      return successResponse(res, list, 'Try-out notifications retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
