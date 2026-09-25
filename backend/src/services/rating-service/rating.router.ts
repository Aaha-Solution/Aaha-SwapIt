import { Router } from 'express';
import { ratingController } from './rating.controller.js';

export const ratingRouter = Router();

// Get reviews and rating summary for a specific user/seller
ratingRouter.get('/user/:userId', ratingController.getUserReviews);

// Get rating summary only
ratingRouter.get('/summary/:userId', ratingController.getRatingSummary);

// Submit a new review
ratingRouter.post('/', ratingController.submitReview);

// Toggle helpful vote on a review
ratingRouter.post('/:reviewId/helpful', ratingController.toggleHelpful);
