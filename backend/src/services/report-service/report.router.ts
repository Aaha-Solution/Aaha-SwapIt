import { Router } from 'express';
import { reportController } from './report.controller.js';
import { optionalAuth, requireAuth, requireAdmin } from '../../middleware/auth.middleware.js';

export const reportRouter = Router();

// Submit report (logged-in user or guest)
reportRouter.post('/', optionalAuth, reportController.submitReport);

// Get Trust & Safety public statistics
reportRouter.get('/stats', reportController.getSafetyStats);

// Admin: List all moderation reports
reportRouter.get('/admin', requireAuth, requireAdmin, reportController.getAdminReports);

// Admin: Get single report details
reportRouter.get('/admin/:id', requireAuth, requireAdmin, reportController.getReportById);

// Admin: Update report resolution and actions
reportRouter.patch('/admin/:id', requireAuth, requireAdmin, reportController.updateReport);
