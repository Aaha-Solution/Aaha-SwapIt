module.exports = {
  ROLES: {
    ADMIN: 'Admin',
    AUDITOR: 'Auditor',
    LINE_ENGINEER: 'LineEngineer',
    TOOLING_ENGINEER: 'ToolingEngineer',
    USER: 'User'
  },
  AUDIT_STATUS: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    REJECTED: 'rejected'
  },
  REJECTION_STATUS: {
    REPORTED: 'reported',
    INVESTIGATING: 'investigating',
    ACTION_TAKEN: 'action_taken',
    CLOSED: 'closed'
  },
  TRIAL_RESULT: {
    PASS: 'pass',
    FAIL: 'fail',
    CONDITIONAL: 'conditional'
  }
};
