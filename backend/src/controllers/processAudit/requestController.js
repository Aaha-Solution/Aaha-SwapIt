const requestService = require('../../services/processAudit/requestService');
const { successResponse } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');

const requestController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query.page, req.query.limit);
      const requests = await requestService.getRequests(pagination);
      return successResponse(res, requests, 'Requests retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const request = await requestService.getRequestById(req.params.id);
      return successResponse(res, request, 'Request retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await requestService.createRequest(req.body);
      return successResponse(res, created, 'Request created', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = requestController;
