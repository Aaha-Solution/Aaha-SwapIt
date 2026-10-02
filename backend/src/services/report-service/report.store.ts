import fs from 'fs';
import path from 'path';
import { Report, CreateReportDTO, UpdateReportDTO, SafetyStats } from './report.types.js';

const STORE_PATH = path.resolve(process.cwd(), 'reports_store.json');

export const inMemoryReports: Report[] = [
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
  {
    id: 'rep-3',
    reporterId: 'usr-buyer-arun',
    reporterName: 'Arun Kumar',
    reporterEmail: 'arun@example.com',
    productId: 'prod-spam-listing',
    productTitle: 'Cryptocurrency Trading Bot Software Activation',
    productPrice: 5000,
    sellerId: 'usr-spammer-88',
    sellerName: 'FastCrypto',
    reason: 'prohibited_item',
    description: 'Seller is posting spam links to an external crypto website not allowed by community safety guidelines.',
    status: 'resolved',
    actionTaken: 'listing_removed',
    adminNotes: 'Listing taken down and seller issued community policy violation strike.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

// Load persisted reports from disk if available
try {
  if (fs.existsSync(STORE_PATH)) {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      inMemoryReports.length = 0;
      inMemoryReports.push(...parsed);
    }
  }
} catch {
  // Use in-memory default reports
}

function persistStore(): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(inMemoryReports, null, 2), 'utf-8');
  } catch {
    // Ignore persistence errors in test environments
  }
}

export const reportStore = {
  getAllReports(status?: string, reason?: string): Report[] {
    let list = [...inMemoryReports];
    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }
    if (reason && reason !== 'all') {
      list = list.filter((r) => r.reason === reason);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getReportById(id: string): Report | undefined {
    return inMemoryReports.find((r) => r.id === id);
  },

  createReport(data: CreateReportDTO, reporterId: string, reporterName: string, reporterEmail?: string): Report {
    const newReport: Report = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reporterId,
      reporterName,
      reporterEmail: reporterEmail || data.reporterEmail,
      productId: data.productId,
      productTitle: data.productTitle,
      productPrice: data.productPrice,
      productImage: data.productImage,
      sellerId: data.sellerId,
      sellerName: data.sellerName,
      reason: data.reason,
      description: data.description,
      status: 'pending',
      actionTaken: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryReports.unshift(newReport);
    persistStore();
    return newReport;
  },

  updateReport(id: string, update: UpdateReportDTO): Report | null {
    const report = inMemoryReports.find((r) => r.id === id);
    if (!report) return null;

    if (update.status) report.status = update.status;
    if (update.actionTaken) report.actionTaken = update.actionTaken;
    if (update.adminNotes !== undefined) report.adminNotes = update.adminNotes;
    report.updatedAt = new Date().toISOString();

    persistStore();
    return report;
  },

  deleteReport(id: string): boolean {
    const index = inMemoryReports.findIndex((r) => r.id === id);
    if (index === -1) return false;
    inMemoryReports.splice(index, 1);
    persistStore();
    return true;
  },

  getSafetyStats(): SafetyStats {
    const total = inMemoryReports.length;
    const pending = inMemoryReports.filter((r) => r.status === 'pending').length;
    const investigating = inMemoryReports.filter((r) => r.status === 'investigating').length;
    const resolved = inMemoryReports.filter((r) => r.status === 'resolved').length;
    const dismissed = inMemoryReports.filter((r) => r.status === 'dismissed').length;
    const takedowns = inMemoryReports.filter((r) => r.actionTaken === 'listing_removed').length;

    // Trust safety score calculated based on resolution rate
    const trustSafetyScore = total > 0 ? Math.round(((resolved + dismissed) / total) * 100) : 98;

    return {
      totalReports: total,
      pendingReports: pending,
      investigatingReports: investigating,
      resolvedReports: resolved,
      dismissedReports: dismissed,
      takedownsCount: takedowns,
      trustSafetyScore,
    };
  },
};
