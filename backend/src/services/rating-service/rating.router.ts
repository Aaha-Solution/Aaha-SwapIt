import { Router } from 'express';
import { ratingController } from './rating.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const ratingRouter = Router();

// Get reviews and rating summary for a specific user/seller (Public)
ratingRouter.get('/user/:userId', ratingController.getUserReviews);

// Get rating summary only (Public)
ratingRouter.get('/summary/:userId', ratingController.getRatingSummary);

// Submit a new review (Authenticated only)
ratingRouter.post('/', requireAuth, ratingController.submitReview);

// Toggle helpful vote on a review (Authenticated only)
ratingRouter.post('/:reviewId/helpful', requireAuth, ratingController.toggleHelpful);

