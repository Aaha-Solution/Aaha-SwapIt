const Scrap = require('../../models/ihlr/Scrap');

const scrapService = {
  async getAllScraps(pagination) {
    return Scrap.getAll(pagination);
  },
  async createScrap(data) {
    const scrapCode = 'SCR-' + Date.now();
    return Scrap.create({ ...data, scrap_code: scrapCode });
  }
};

module.exports = scrapService;
