const PilotBatch = require('../../models/tryOutStatus/PilotBatch');

const pilotBatchService = {
  async getAllBatches(pagination) {
    return PilotBatch.getAll(pagination);
  },
  async createBatch(data) {
    const pilotCode = 'PB-' + Date.now();
    return PilotBatch.create({ ...data, pilot_code: pilotCode });
  }
};

module.exports = pilotBatchService;
