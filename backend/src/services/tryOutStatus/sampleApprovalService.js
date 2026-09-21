const SampleApproval = require('../../models/tryOutStatus/SampleApproval');

const sampleApprovalService = {
  async getAllApprovals(pagination) {
    return SampleApproval.getAll(pagination);
  },
  async createApproval(data) {
    const sampleCode = 'SA-' + Date.now();
    return SampleApproval.create({ ...data, sample_code: sampleCode });
  }
};

module.exports = sampleApprovalService;
