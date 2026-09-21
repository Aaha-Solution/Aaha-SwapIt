const trialRunService = require('../../services/tryOutStatus/trialRunService');
const { successResponse } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');

const trialRunController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query.page, req.query.limit);
      const items = await trialRunService.getAllTrials(pagination);
      return successResponse(res, items, 'Trial runs retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await trialRunService.createTrial(req.body);
      return successResponse(res, created, 'Trial run recorded', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = trialRunController;
