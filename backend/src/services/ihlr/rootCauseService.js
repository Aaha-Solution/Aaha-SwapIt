const RootCause = require('../../models/ihlr/RootCause');

const rootCauseService = {
  async getByRejectionId(rejectionId) {
    return RootCause.getByRejectionId(rejectionId);
  },
  async createRootCause(data) {
    return RootCause.create(data);
  }
};

module.exports = rootCauseService;
