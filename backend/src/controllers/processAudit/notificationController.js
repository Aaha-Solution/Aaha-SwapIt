const notificationService = require('../../services/processAudit/notificationService');
const { successResponse } = require('../../utils/response');

const notificationController = {
  async list(req, res, next) {
    try {
      const list = await notificationService.getAuditNotifications(req.user ? req.user.id : null);
      return successResponse(res, list, 'Audit notifications retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
