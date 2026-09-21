const scrapService = require('../../services/ihlr/scrapService');
const { successResponse } = require('../../utils/response');
const { getPagination } = require('../../utils/pagination');

const scrapController = {
  async list(req, res, next) {
    try {
      const pagination = getPagination(req.query.page, req.query.limit);
      const items = await scrapService.getAllScraps(pagination);
      return successResponse(res, items, 'Scrap items retrieved');
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const created = await scrapService.createScrap(req.body);
      return successResponse(res, created, 'Scrap entry created', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = scrapController;
