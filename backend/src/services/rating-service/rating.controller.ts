import crypto from 'crypto';
import { Request, Response } from 'express';
import {
  getReviewsByTargetUserId,
  calculateRatingSummary,
  addReviewToStore,
  toggleHelpfulInStore,
} from './rating.store.js';
import { addNotificationToStore } from '../notification-service/notification.store.js';
import { logger } from '../../shared/logger.js';
import { Review } from './rating.types.js';

export const ratingController = {
  async getUserReviews(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const targetUserId = userId || 'usr-demo-iyyanar';

      const reviews = getReviewsByTargetUserId(targetUserId);
      const summary = calculateRatingSummary(targetUserId);

      return res.json({
        success: true,
        data: {
          reviews,
          summary,
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'Error fetching user reviews');
      return res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
    }
  },

  async getRatingSummary(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const targetUserId = userId || 'usr-demo-iyyanar';
      const summary = calculateRatingSummary(targetUserId);

      return res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      logger.error({ error }, 'Error fetching rating summary');
      return res.status(500).json({ success: false, message: 'Failed to fetch rating summary' });
    }
  },

  async submitReview(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      const reviewerId = authUser?.id || 'usr-demo-iyyanar';
      const reviewerName = authUser?.name || 'SwapIt User';
      const reviewerAvatar = authUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

      const { targetUserId, rating, comment, tags, productId, productTitle } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ success: false, message: 'targetUserId is required' });
      }

      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
      }

      if (!comment || comment.trim().length === 0) {
        return res.status(400).json({ success: false, message: 'Review comment cannot be empty' });
      }

      const randomId = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 10);

      const newReview: Review = {
        id: `rev-${randomId}`,
        targetUserId,
        reviewerId,
        reviewerName,
        reviewerAvatar,
        rating: Math.round(rating),
        comment: comment.trim(),
        tags: Array.isArray(tags) ? tags : [],
        productId: productId || undefined,
        productTitle: productTitle || undefined,
        helpfulCount: 0,
        helpfulUserIds: [],
        createdAt: new Date().toISOString(),
      };

      const savedReview = addReviewToStore(newReview);
      const updatedSummary = calculateRatingSummary(targetUserId);

      // Create notification for the seller/target user
      const starsDisplay = '★'.repeat(savedReview.rating);
      const notif = addNotificationToStore({
        id: `notif-${randomId}`,
        userId: targetUserId,
        title: `⭐ New Review Received (${starsDisplay})`,
        message: `${reviewerName} gave you a ${savedReview.rating}-star review: "${savedReview.comment.slice(0, 60)}${savedReview.comment.length > 60 ? '...' : ''}"`,
        type: 'deal',
        read: false,
        link: '/profile',
        avatarUrl: reviewerAvatar,
        createdAt: new Date().toISOString(),
      });

      // Broadcast real-time notification if socket exists
      const io = req.app.get('io');
      if (io) {
        io.to(`user:${targetUserId}`).emit('notification:new', notif);
      }

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: {
          review: savedReview,
          summary: updatedSummary,
        },
      });
    } catch (error: any) {
      logger.error({ error }, 'Error submitting review');
      return res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
  },

  async toggleHelpful(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      const authUser = (req as any).user;
      const userId = authUser?.id || 'usr-demo-iyyanar';

      const result = toggleHelpfulInStore(reviewId, userId);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      return res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error({ error }, 'Error toggling helpful vote');
      return res.status(500).json({ success: false, message: 'Failed to update vote' });
    }
  },
};
