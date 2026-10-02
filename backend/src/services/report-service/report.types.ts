export type ReportReason =
  | 'fraud_scam'
  | 'counterfeit'
  | 'prohibited_item'
  | 'inaccurate_description'
  | 'harassment'
  | 'suspicious_seller'
  | 'other';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export type ModerationAction = 'none' | 'warning_sent' | 'listing_removed' | 'seller_suspended';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterEmail?: string;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  sellerId?: string;
  sellerName?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  actionTaken?: ModerationAction;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDTO {
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  sellerId?: string;
  sellerName?: string;
  reason: ReportReason;
  description: string;
  reporterEmail?: string;
}

export interface UpdateReportDTO {
  status?: ReportStatus;
  actionTaken?: ModerationAction;
  adminNotes?: string;
}

export interface SafetyStats {
  totalReports: number;
  pendingReports: number;
  investigatingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  takedownsCount: number;
  trustSafetyScore: number;
}
