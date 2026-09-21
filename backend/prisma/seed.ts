import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DealKart database seeding...');

  // 1. Create Demo Admin & User
  const passwordHash = await bcrypt.hash('Password@123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'iyyanar@example.com' },
    update: {},
    create: {
      id: 'usr-demo-iyyanar',
      email: 'iyyanar@example.com',
      password: passwordHash,
      name: 'Iyyanar',
      phone: '+91 98401 98765',
      location: 'Chennai',
      verified: true,
      role: 'admin',
      memberSince: 'Sep 2024',
    },
  });

  const sellerUser = await prisma.user.upsert({
    where: { email: 'rajesh.k@example.com' },
    update: {},
    create: {
      id: 'usr-seller-rajesh',
      email: 'rajesh.k@example.com',
      password: passwordHash,
      name: 'Rajesh Kumar',
      phone: '+91 98401 23456',
      location: 'Chennai',
      verified: true,
      role: 'user',
      memberSince: 'Jan 2025',
    },
  });

  console.log('✅ Demo users seeded');

  // 2. Categories
  const categoriesData = [
    { id: 'cat-mobiles', name: 'Mobiles & Tablets', slug: 'mobiles', icon: 'Smartphone', count: 42 },
    { id: 'cat-electronics', name: 'Electronics & Laptops', slug: 'electronics', icon: 'Laptop', count: 68 },
    { id: 'cat-vehicles', name: 'Cars & Bikes', slug: 'vehicles', icon: 'Car', count: 35 },
    { id: 'cat-furniture', name: 'Home & Furniture', slug: 'furniture', icon: 'Armchair', count: 29 },
    { id: 'cat-fashion', name: 'Fashion & Wearables', slug: 'fashion', icon: 'Watch', count: 54 },
    { id: 'cat-books', name: 'Books, Sports & Hobbies', slug: 'books', icon: 'BookOpen', count: 18 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, count: cat.count },
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // 3. Products
  const productsData = [
    {
      id: 'prod-1',
      title: 'iPhone 15 Pro Max - 256GB Natural Titanium (Mint Condition)',
      price: 89999,
      description: 'Under Apple warranty till Dec 2026. Battery health 98%. Includes original box, braided USB-C cable, and Spigen Armor case. Bill and box available.',
      categoryId: 'cat-mobiles',
      categoryName: 'mobiles',
      condition: 'Like New',
      city: 'Chennai',
      location: 'T. Nagar, Chennai',
      postedAt: '2 hours ago',
      imageUrl: '/images/iphone15.png',
      images: ['/images/iphone15.png'],
      status: 'active',
      views: 342,
      featured: true,
      badge: 'featured',
      badgeText: 'Featured',
      sellerId: sellerUser.id,
    },
    {
      id: 'prod-2',
      title: 'MacBook Air M2 (16GB RAM, 512GB SSD) - Space Grey',
      price: 74500,
      description: 'Used solely for UI design work. Minimal battery cycles (48 cycles). Flawless condition without a single scratch. MagSafe charger included.',
      categoryId: 'cat-electronics',
      categoryName: 'electronics',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Velachery, Chennai',
      postedAt: '5 hours ago',
      imageUrl: '/images/laptop_macbook.png',
      images: ['/images/laptop_macbook.png'],
      status: 'active',
      views: 520,
      featured: true,
      badge: 'likenew',
      badgeText: 'Like New',
      sellerId: demoUser.id,
    },
    {
      id: 'prod-3',
      title: 'Royal Enfield Hunter 350 Dapper Ash (2024 Model, 4,200 km)',
      price: 135000,
      description: 'Single owner, comprehensive insurance valid till 2027. First two services done at authorized Royal Enfield service center. Showroom condition.',
      categoryId: 'cat-vehicles',
      categoryName: 'vehicles',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Anna Nagar, Chennai',
      postedAt: '1 day ago',
      imageUrl: '/images/bike_hunter.png',
      images: ['/images/bike_hunter.png'],
      status: 'active',
      views: 812,
      featured: true,
      badge: 'verified',
      badgeText: 'Verified Seller',
      sellerId: sellerUser.id,
    },
    {
      id: 'prod-4',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      price: 18500,
      description: 'Industry leading noise cancellation, crystal clear calling, 30-hour battery life. Comes with premium carrying case and audio cable.',
      categoryId: 'cat-electronics',
      categoryName: 'electronics',
      condition: 'Good',
      city: 'Bangalore',
      location: 'Koramangala, Bangalore',
      postedAt: '1 day ago',
      imageUrl: '/images/sony_headphones.png',
      images: ['/images/sony_headphones.png'],
      status: 'active',
      views: 290,
      featured: false,
      badge: 'good',
      badgeText: 'Great Deal',
      sellerId: demoUser.id,
    },
    {
      id: 'prod-5',
      title: 'Solid Sheesham Wood 6-Seater Dining Table with Chairs',
      price: 24000,
      description: 'Crafted from authentic Sheesham wood with dark walnut finish. Cushioned seats in high density foam. Moving out sale.',
      categoryId: 'cat-furniture',
      categoryName: 'furniture',
      condition: 'Good',
      city: 'Chennai',
      location: 'Adyar, Chennai',
      postedAt: '2 days ago',
      imageUrl: '/images/dining_table.png',
      images: ['/images/dining_table.png'],
      status: 'active',
      views: 195,
      featured: false,
      sellerId: sellerUser.id,
    },
    {
      id: 'prod-6',
      title: 'PlayStation 5 Disc Edition (with 2 DualSense Controllers & 3 Games)',
      price: 38000,
      description: 'PS5 Disc model with extra Cosmic Red DualSense controller. Includes Spider-Man 2, God of War Ragnarok, and FC24 game discs.',
      categoryId: 'cat-electronics',
      categoryName: 'electronics',
      condition: 'Like New',
      city: 'Coimbatore',
      location: 'RS Puram, Coimbatore',
      postedAt: '3 days ago',
      imageUrl: '/images/ps5_console.png',
      images: ['/images/ps5_console.png'],
      status: 'active',
      views: 640,
      featured: true,
      badge: 'featured',
      badgeText: 'Hot Deal',
      sellerId: sellerUser.id,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod,
    });
  }
  console.log('✅ Products seeded');

  // 4. Seed sample wishlist
  await prisma.wishlistItem.upsert({
    where: {
      userId_productId: {
        userId: demoUser.id,
        productId: 'prod-1',
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      productId: 'prod-1',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
