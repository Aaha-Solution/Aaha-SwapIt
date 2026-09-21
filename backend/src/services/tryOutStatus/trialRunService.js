const TrialRun = require('../../models/tryOutStatus/TrialRun');

const trialRunService = {
  async getAllTrials(pagination) {
    return TrialRun.getAll(pagination);
  },
  async createTrial(data) {
    const trialCode = 'TR-' + Date.now();
    return TrialRun.create({ ...data, trial_code: trialCode });
  }
};

module.exports = trialRunService;
