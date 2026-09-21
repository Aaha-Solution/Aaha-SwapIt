const { successResponse } = require('../../utils/response');

const dashboardController = {
  async getMetrics(req, res, next) {
    try {
      const metrics = {
        activeTrials: 16,
        pilotBatches: 8,
        pendingApprovals: 5,
        firstTimeRightRate: '88.5%'
      };
      return successResponse(res, metrics, 'Try-Out dashboard metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dashboardController;
