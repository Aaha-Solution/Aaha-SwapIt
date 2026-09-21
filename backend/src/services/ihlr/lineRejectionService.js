const LineRejection = require('../../models/ihlr/LineRejection');

const lineRejectionService = {
  async getAllRejections(pagination) {
    return LineRejection.getAll(pagination);
  },
  async createRejection(data) {
    return LineRejection.create(data);
  }
};

module.exports = lineRejectionService;
