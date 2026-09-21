const { successResponse } = require('../../utils/response');

const dashboardController = {
  async getMetrics(req, res, next) {
    try {
      const metrics = {
        totalRejections: 142,
        totalScrapCost: 52400.0,
        ppmRate: 240,
        resolvedIssues: 128
      };
      return successResponse(res, metrics, 'IHLR metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dashboardController;
