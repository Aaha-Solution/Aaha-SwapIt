import { prisma } from '../shared/prisma.js';

const API_BASE = 'http://localhost:5000/api';

interface TestResult {
  suite: string;
  name: string;
  status: 'PASS' | 'FAIL';
  durationMs: number;
  details?: any;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<any>) {
  const start = Date.now();
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    results.push({ suite, name, status: 'PASS', durationMs, details });
    console.log(`  ✅ [PASS] ${name} (${durationMs}ms)`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ suite, name, status: 'FAIL', durationMs, error: err.message || String(err) });
    console.error(`  ❌ [FAIL] ${name} (${durationMs}ms) -> ${err.message || String(err)}`);
  }
}

async function main() {
  console.log('\n=======================================================');
  console.log('🚀 DealKart / SwapIt Full System & Database Test Suite');
  console.log('=======================================================\n');

  // 1. Direct Prisma & MySQL Database Verification
  console.log('📦 1. DIRECT MYSQL DATABASE CONNECTION & TABLES');
  await runTest('Database', 'MySQL Ping / SELECT 1 Query', async () => {
    const res = await prisma.$queryRaw`SELECT 1 as connected`;
    if (!res) throw new Error('Failed to query MySQL');
    return res;
  });

  await runTest('Database', 'Verify Users Table & Count', async () => {
    const userCount = await prisma.user.count();
    const sampleUser = await prisma.user.findFirst();
    if (userCount === 0) throw new Error('No users found in database');
    return { userCount, sampleEmail: sampleUser?.email };
  });

  await runTest('Database', 'Verify Categories Table & Count', async () => {
    const catCount = await prisma.category.count();
    if (catCount === 0) throw new Error('No categories found in database');
    return { catCount };
  });

  await runTest('Database', 'Verify Products Table & Relationships', async () => {
    const productCount = await prisma.product.count();
    const sample = await prisma.product.findFirst({
      include: { seller: true },
    });
    if (productCount === 0) throw new Error('No products found in database');
    if (!sample?.seller) throw new Error('Product is missing seller relation');
    return { productCount, sampleTitle: sample.title, sellerName: sample.seller.name };
  });

  // 2. Gateway & Health API
  console.log('\n🌐 2. GATEWAY & MICROSERVICES HEALTH API');
  await runTest('Gateway', 'GET /api/health', async () => {
    const res = await fetch(`${API_BASE}/health`);
    const json = await res.json();
    if (json.status !== 'healthy' || json.integrations.database.status !== 'connected') {
      throw new Error(`Unhealthy status: ${JSON.stringify(json)}`);
    }
    return json.integrations;
  });

  // 3. Products Microservice
  console.log('\n🛍️ 3. PRODUCTS MICROSERVICE');
  let testProductId = '';
  await runTest('Products', 'GET /api/products (Feed & Pagination)', async () => {
    const res = await fetch(`${API_BASE}/products?limit=5`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('Failed to fetch products list');
    }
    testProductId = json.data[0].id;
    return { count: json.data.length, total: json.meta.total };
  });

  await runTest('Products', 'GET /api/products/:id (Product Details)', async () => {
    if (!testProductId) throw new Error('No product ID available to test');
    const res = await fetch(`${API_BASE}/products/${testProductId}`);
    const json = await res.json();
    if (!json.success || !json.data || json.data.id !== testProductId) {
      throw new Error('Failed to fetch product details');
    }
    return { id: json.data.id, title: json.data.title, price: json.data.price };
  });

  await runTest('Products', 'GET /api/products/suggestions?q=car', async () => {
    const res = await fetch(`${API_BASE}/products/suggestions?q=car`);
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error('Failed to fetch search suggestions');
    }
    return { foundProducts: json.data.products?.length };
  });

  // 4. Categories & Locations
  console.log('\n🏷️ 4. CATEGORIES & LOCATIONS');
  await runTest('Categories', 'GET /api/categories', async () => {
    const res = await fetch(`${API_BASE}/categories`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('Failed to load categories');
    }
    return { count: json.data.length };
  });

  await runTest('Locations', 'GET /api/locations', async () => {
    const res = await fetch(`${API_BASE}/locations`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error('Failed to load cities');
    }
    return { cities: json.data };
  });

  // 5. User Profile & Ads
  console.log('\n👤 5. USER & PROFILE SERVICE');
  await runTest('Users', 'GET /api/users/profile (Demo User)', async () => {
    const res = await fetch(`${API_BASE}/users/profile`);
    const json = await res.json();
    if (!json.success || !json.data) {
      throw new Error('Failed to fetch user profile');
    }
    return { name: json.data.name, email: json.data.email, verified: json.data.verified };
  });

  await runTest('Users', 'GET /api/users/my-ads', async () => {
    const res = await fetch(`${API_BASE}/users/my-ads`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Failed to fetch user listings');
    }
    return { myAdsCount: json.data.length };
  });

  // 6. Ratings & Reviews Microservice
  console.log('\n⭐ 6. RATINGS & REVIEWS / TRUST SYSTEM');
  await runTest('Ratings', 'GET /api/ratings/user/:userId', async () => {
    const res = await fetch(`${API_BASE}/ratings/user/usr-demo-iyyanar`);
    const json = await res.json();
    if (!json.success || !json.data || !json.data.summary) {
      throw new Error('Failed to fetch ratings and summary');
    }
    return {
      reviewsCount: json.data.reviews.length,
      averageRating: json.data.summary.averageRating,
      breakdown: json.data.summary.breakdown,
    };
  });

  let createdReviewId = '';
  await runTest('Ratings', 'POST /api/ratings (Submit Verified Review)', async () => {
    const payload = {
      targetUserId: 'usr-demo-iyyanar',
      rating: 5,
      comment: 'Automated integration test review: Verified fast exchange and genuine seller!',
      tags: ['Fast Delivery', 'Item as Described', 'Smooth Swap'],
      productId: testProductId,
      productTitle: 'Automated Test Product',
    };
    const res = await fetch(`${API_BASE}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success || !json.data || !json.data.review) {
      throw new Error(`Failed to submit review: ${json.message}`);
    }
    createdReviewId = json.data.review.id;
    return { reviewId: createdReviewId, newAverage: json.data.summary.averageRating };
  });

  if (createdReviewId) {
    await runTest('Ratings', 'POST /api/ratings/:reviewId/helpful (Vote Helpful)', async () => {
      const res = await fetch(`${API_BASE}/ratings/${createdReviewId}/helpful`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!json.success || json.data.helpfulCount === undefined) {
        throw new Error('Failed to toggle helpful vote');
      }
      return { helpfulCount: json.data.helpfulCount, isHelpful: json.data.isHelpful };
    });
  }

  // 7. Chat & Negotiation Microservice
  console.log('\n💬 7. CHAT & CONVERSATIONS MICROSERVICE');
  await runTest('Chat', 'GET /api/chat/conversations', async () => {
    const res = await fetch(`${API_BASE}/chat/conversations`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Failed to fetch conversations');
    }
    return { conversationsCount: json.data.length };
  });

  await runTest('Chat', 'GET /api/chat/history/usr-1', async () => {
    const res = await fetch(`${API_BASE}/chat/history/usr-1`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Failed to fetch chat history');
    }
    return { messagesCount: json.data.length };
  });

  // 8. Notifications Microservice
  console.log('\n🔔 8. NOTIFICATIONS MICROSERVICE');
  await runTest('Notifications', 'GET /api/notifications', async () => {
    const res = await fetch(`${API_BASE}/notifications`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Failed to fetch notifications');
    }
    return { notificationsCount: json.data.length, unreadCount: json.unreadCount };
  });

  // 9. Summary & Final Verdict
  console.log('\n=======================================================');
  console.log('📊 TEST EXECUTION SUMMARY');
  console.log('=======================================================');

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log(`Total Tests Run : ${total}`);
  console.log(`Passed          : ${passed}`);
  console.log(`Failed          : ${failed}`);
  console.log(`Total Time      : ${totalDuration}ms`);

  if (failed === 0) {
    console.log('\n🎉 ALL SYSTEMS & DATABASE CONNECTIONS OPERATIONAL!\n');
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed. See details above.\n`);
    process.exit(1);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal testing error:', err);
  process.exit(1);
});
