const Request = require('../../models/processAudit/Request');

const requestService = {
  async getRequests(pagination) {
    return Request.getAll(pagination);
  },
  async getRequestById(id) {
    return Request.findById(id);
  },
  async createRequest(data) {
    const requestNumber = 'AUD-' + Date.now();
    return Request.create({ ...data, request_number: requestNumber });
  }
};

module.exports = requestService;
