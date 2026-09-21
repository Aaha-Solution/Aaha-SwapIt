const sampleApprovalService = require('../../services/tryOutStatus/sampleApprovalService');
const { successResponse } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');

const sampleApprovalController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query.page, req.query.limit);
      const items = await sampleApprovalService.getAllApprovals(pagination);
      return successResponse(res, items, 'Sample approvals retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await sampleApprovalService.createApproval(req.body);
      return successResponse(res, created, 'Sample approval recorded', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = sampleApprovalController;
