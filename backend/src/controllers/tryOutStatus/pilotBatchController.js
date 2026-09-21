const pilotBatchService = require('../../services/tryOutStatus/pilotBatchService');
const { successResponse } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');

const pilotBatchController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query.page, req.query.limit);
      const items = await pilotBatchService.getAllBatches(pagination);
      return successResponse(res, items, 'Pilot batches retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await pilotBatchService.createBatch(req.body);
      return successResponse(res, created, 'Pilot batch registered', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = pilotBatchController;
