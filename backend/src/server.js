const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/env');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

// App Initialization
const app = express();

// Security & Utility Middlewares
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DealKart Backend API'
  });
});

// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Process Audit Routes
app.use('/api/process-audit/dashboard', require('./routes/processAudit/dashboardRoutes'));
app.use('/api/process-audit/requests', require('./routes/processAudit/requestRoutes'));
app.use('/api/process-audit/notifications', require('./routes/processAudit/notificationRoutes'));
app.use('/api/process-audit/users', require('./routes/processAudit/userRoutes'));

// IHLR Routes
app.use('/api/ihlr/dashboard', require('./routes/ihlr/dashboardRoutes'));
app.use('/api/ihlr/line-rejections', require('./routes/ihlr/lineRejectionRoutes'));
app.use('/api/ihlr/scraps', require('./routes/ihlr/scrapRoutes'));
app.use('/api/ihlr/root-causes', require('./routes/ihlr/rootCauseRoutes'));
app.use('/api/ihlr/notifications', require('./routes/ihlr/notificationRoutes'));
app.use('/api/ihlr/users', require('./routes/ihlr/userRoutes'));

// Try-Out Status Routes
app.use('/api/try-out-status/dashboard', require('./routes/tryOutStatus/dashboardRoutes'));
app.use('/api/try-out-status/trial-runs', require('./routes/tryOutStatus/trialRunRoutes'));
app.use('/api/try-out-status/pilot-batches', require('./routes/tryOutStatus/pilotBatchRoutes'));
app.use('/api/try-out-status/sample-approvals', require('./routes/tryOutStatus/sampleApprovalRoutes'));
app.use('/api/try-out-status/notifications', require('./routes/tryOutStatus/notificationRoutes'));
app.use('/api/try-out-status/users', require('./routes/tryOutStatus/userRoutes'));

// Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` DealKart Backend Server running on port ${PORT}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);
});

module.exports = app;
