import { Request, Response } from 'express';
import { reportStore } from './report.store.js';
import { CreateReportDTO, UpdateReportDTO, ReportReason } from './report.types.js';
import { logger } from '../../shared/logger.js';

const VALID_REASONS: ReportReason[] = [
  'fraud_scam',
  'counterfeit',
  'prohibited_item',
  'inaccurate_description',
  'harassment',
  'suspicious_seller',
  'other',
];

export const reportController = {
  /**
   * Submit a new report for a product or seller
   */
  async submitReport(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const {
        productId,
        productTitle,
        productPrice,
        productImage,
        sellerId,
        sellerName,
        reason,
        description,
        reporterEmail,
      } = req.body as CreateReportDTO;

      if (!reason || !VALID_REASONS.includes(reason)) {
        res.status(400).json({
          success: false,
          error: `Invalid report reason. Allowed reasons: ${VALID_REASONS.join(', ')}`,
        });
        return;
      }

      if (!description || description.trim().length < 5) {
        res.status(400).json({
          success: false,
          error: 'Please provide a descriptive reason (at least 5 characters).',
        });
        return;
      }

      const reporterId = user?.id || 'usr-anonymous-guest';
      const reporterName = user?.name || (reporterEmail ? reporterEmail.split('@')[0] : 'Community Member');
      const email = user?.email || reporterEmail;

      const report = reportStore.createReport(
        {
          productId,
          productTitle,
          productPrice,
          productImage,
          sellerId,
          sellerName,
          reason,
          description: description.trim(),
          reporterEmail: email,
        },
        reporterId,
        reporterName,
        email
      );

      logger.info({ reportId: report.id, reason, productId }, '🛡️ Safety report submitted successfully');

      res.status(201).json({
        success: true,
        message: 'Thank you for keeping SwapIt safe. Our Trust & Safety team has received your report and is investigating.',
        data: report,
      });
    } catch (err: any) {
      logger.error(err, 'Failed to submit safety report');
      res.status(500).json({
        success: false,
        error: 'Failed to process report. Please try again.',
      });
    }
  },

  /**
   * Admin: Get all reports with optional filters
   */
  async getAdminReports(req: Request, res: Response): Promise<void> {
    try {
      const { status, reason } = req.query;
      const reports = reportStore.getAllReports(status as string, reason as string);
      const stats = reportStore.getSafetyStats();

      res.status(200).json({
        success: true,
        data: {
          reports,
          stats,
        },
      });
    } catch (err: any) {
      logger.error(err, 'Failed to fetch admin reports');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  /**
   * Admin: Get a single report by ID
   */
  async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const report = reportStore.getReportById(id);

      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (err: any) {
      logger.error(err, 'Failed to fetch report');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  /**
   * Admin: Update report status, moderation action, and admin notes
   */
  async updateReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body as UpdateReportDTO;

      const updated = reportStore.updateReport(id, updateData);

      if (!updated) {
        res.status(404).json({
          success: false,
          error: 'Report not found',
        });
        return;
      }

      logger.info({ reportId: id, status: updated.status, action: updated.actionTaken }, '🛡️ Report moderation updated');

      res.status(200).json({
        success: true,
        message: 'Report status updated successfully',
        data: updated,
      });
    } catch (err: any) {
      logger.error(err, 'Failed to update report');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },

  /**
   * Get public/admin Trust & Safety statistics
   */
  async getSafetyStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = reportStore.getSafetyStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (err: any) {
      logger.error(err, 'Failed to fetch safety stats');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  },
};
