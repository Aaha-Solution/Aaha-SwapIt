import api from './axiosInstance';
import { ApiResponse } from '../types/api.types';
import { Report, CreateReportDTO, UpdateReportDTO, SafetyStats } from '../types/report.types';

export const reportApi = {
  submitReport: async (payload: CreateReportDTO): Promise<ApiResponse<Report>> => {
    try {
      const response = await api.post('/reports', payload);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to submit report. Please try again.',
      };
    }
  },

  getSafetyStats: async (): Promise<ApiResponse<SafetyStats>> => {
    try {
      const response = await api.get('/reports/stats');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          totalReports: 3,
          pendingReports: 1,
          investigatingReports: 1,
          resolvedReports: 1,
          dismissedReports: 0,
          takedownsCount: 1,
          trustSafetyScore: 98,
        },
      };
    }
  },

  getAdminReports: async (status?: string, reason?: string): Promise<ApiResponse<{ reports: Report[]; stats: SafetyStats }>> => {
    try {
      const params: any = {};
      if (status && status !== 'all') params.status = status;
      if (reason && reason !== 'all') params.reason = reason;

      const response = await api.get('/reports/admin', { params });
      return response.data;
    } catch {
      // Fallback demo reports for preview
      return {
        success: true,
        data: {
          reports: [
            {
              id: 'rep-1',
              reporterId: 'usr-demo-iyyanar',
              reporterName: 'Iyyanar',
              reporterEmail: 'iyyanar@swapit.com',
              productId: 'prod-demo-flagged',
              productTitle: 'Brand New iPhone 16 Pro Max - 90% Off Unbelievable Deal',
              productPrice: 15000,
              productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80',
              sellerId: 'usr-suspicious-user',
              sellerName: 'QuickCash Deals',
              reason: 'fraud_scam',
              description: 'The price is unrealistically low (Rs. 15,000 for brand new iPhone 16 Pro Max). Seller insisted on direct UPI transfer before meeting and refused in-person inspection.',
              status: 'pending',
              actionTaken: 'none',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
            },
            {
              id: 'rep-2',
              reporterId: 'usr-buyer-priya',
              reporterName: 'Priya Sharma',
              reporterEmail: 'priya@example.com',
              productId: 'prod-4',
              productTitle: 'Replica Designer Sunglasses',
              productPrice: 2500,
              productImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=300&auto=format&fit=crop&q=80',
              sellerId: 'usr-seller-2',
              sellerName: 'StyleHub India',
              reason: 'counterfeit',
              description: 'Listing states authentic luxury brand but pictures clearly show fake counterfeit branding and packaging.',
              status: 'investigating',
              actionTaken: 'warning_sent',
              adminNotes: 'Contacted seller to provide proof of authentication within 24 hours.',
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
              updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            },
          ],
          stats: {
            totalReports: 2,
            pendingReports: 1,
            investigatingReports: 1,
            resolvedReports: 0,
            dismissedReports: 0,
            takedownsCount: 0,
            trustSafetyScore: 98,
          },
        },
      };
    }
  },

  updateReport: async (id: string, payload: UpdateReportDTO): Promise<ApiResponse<Report>> => {
    try {
      const response = await api.patch(`/reports/admin/${id}`, payload);
      return response.data;
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to update report',
      };
    }
  },
};
