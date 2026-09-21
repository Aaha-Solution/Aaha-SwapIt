const { successResponse } = require('../../utils/response');

const dashboardController = {
  async getMetrics(req, res, next) {
    try {
      const metrics = {
        totalAudits: 48,
        pendingCapa: 12,
        openObservations: 7,
        complianceRate: '94.2%'
      };
      return successResponse(res, metrics, 'Audit dashboard metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dashboardController;
