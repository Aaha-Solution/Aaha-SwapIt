import { api } from './axiosInstance';
import { ApiResponse } from '../types/api.types';
import { Offer, CreateOfferPayload, OfferStatus } from '../types/offer.types';

export const offerApi = {
  createOffer: async (payload: CreateOfferPayload): Promise<ApiResponse<Offer>> => {
    const res = await api.post('/offers', payload);
    return res.data;
  },

  getBuyerOffers: async (): Promise<ApiResponse<Offer[]>> => {
    const res = await api.get('/offers/buyer');
    return res.data;
  },

  getSellerOffers: async (): Promise<ApiResponse<Offer[]>> => {
    const res = await api.get('/offers/seller');
    return res.data;
  },

  updateOfferStatus: async (
    id: string,
    status: OfferStatus,
    counterAmount?: number
  ): Promise<ApiResponse<Offer>> => {
    const res = await api.patch(`/offers/${id}/status`, { status, counterAmount });
    return res.data;
  },
};
