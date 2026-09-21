const lineRejectionService = require('../../services/ihlr/lineRejectionService');
const { successResponse } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');

const lineRejectionController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query.page, req.query.limit);
      const items = await lineRejectionService.getAllRejections(pagination);
      return successResponse(res, items, 'Line rejections retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await lineRejectionService.createRejection(req.body);
      return successResponse(res, created, 'Line rejection recorded', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = lineRejectionController;
