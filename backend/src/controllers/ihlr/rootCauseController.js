const rootCauseService = require('../../services/ihlr/rootCauseService');
const { successResponse } = require('../../utils/response');

const rootCauseController = {
  async getByRejection(req, res, next) {
    try {
      const items = await rootCauseService.getByRejectionId(req.params.rejectionId);
      return successResponse(res, items, 'Root causes retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await rootCauseService.createRootCause(req.body);
      return successResponse(res, created, 'Root cause recorded', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = rootCauseController;
