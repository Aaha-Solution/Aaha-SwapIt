const notificationService = require('../../services/ihlr/notificationService');
const { successResponse } = require('../../utils/response');

const notificationController = {
  async list(req, res, next) {
    try {
      const list = await notificationService.getIhlrNotifications(req.user ? req.user.id : null);
      return successResponse(res, list, 'IHLR notifications retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
