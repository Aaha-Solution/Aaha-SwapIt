import { Router } from 'express';
import { offerController } from './offer.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const offerRouter = Router();

// Create new deal offer on a product
offerRouter.post('/', requireAuth, offerController.createOffer);

// Get offers created by the buyer
offerRouter.get('/buyer', requireAuth, offerController.getBuyerOffers);

// Get offers received by the seller
offerRouter.get('/seller', requireAuth, offerController.getSellerOffers);

// Update deal status (accept, reject, counter, complete)
offerRouter.patch('/:id/status', requireAuth, offerController.updateOfferStatus);
