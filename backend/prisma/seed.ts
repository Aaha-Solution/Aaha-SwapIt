import 'dotenv/config';
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

  const sellers = [
    { id: 'usr-1', name: 'Karthik Raja', email: 'karthik@example.com', phone: '+91 98401 23456', location: 'Chennai' },
    { id: 'usr-2', name: 'Vignesh M', email: 'vignesh@example.com', phone: '+91 97910 88231', location: 'Chennai' },
    { id: 'usr-3', name: 'Suresh Kumar', email: 'suresh@example.com', phone: '+91 94441 55210', location: 'Chennai' },
    { id: 'usr-4', name: 'Ananya Ramesh', email: 'ananya@example.com', phone: '+91 98840 76543', location: 'Chennai' },
    { id: 'usr-5', name: 'Deepak Nathan', email: 'deepak@example.com', phone: '+91 99620 11984', location: 'Chennai' },
    { id: 'usr-6', name: 'Apex Realtors', email: 'apex@example.com', phone: '+91 98410 99882', location: 'Chennai' },
    { id: 'usr-7', name: 'Pravin Studio', email: 'pravin@example.com', phone: '+91 91760 33419', location: 'Chennai' },
    { id: 'usr-8', name: 'Balaji S', email: 'balaji@example.com', phone: '+91 90030 45612', location: 'Chennai' },
  ];

  for (const s of sellers) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, phone: s.phone, location: s.location },
      create: {
        id: s.id,
        email: s.email,
        password: passwordHash,
        name: s.name,
        phone: s.phone,
        location: s.location,
        verified: true,
        role: 'user',
        memberSince: 'Oct 2024',
      },
    });
  }

  console.log('✅ Demo sellers seeded');

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
      title: 'Maruti Swift 2019',
      price: 450000,
      description: 'Single owner, pristine condition, full service history at authorized Maruti center. Driven 42,000 km. Comprehensive insurance valid till Dec 2026.',
      categoryId: 'cat-vehicles',
      categoryName: 'cars',
      condition: 'Like New',
      city: 'Chennai',
      location: 'T. Nagar, Chennai',
      postedAt: '2 hours ago',
      imageUrl: '/images/car_red.jpg',
      images: ['/images/car_red.jpg'],
      status: 'active',
      views: 142,
      featured: true,
      badge: 'featured',
      badgeText: 'Featured',
      sellerId: 'usr-1',
    },
    {
      id: 'prod-2',
      title: 'Yamaha FZ',
      price: 85000,
      description: 'Yamaha FZ Version 3.0 in racing blue. Brand new rear Michelin tire, smooth engine, no accident history. All papers clear.',
      categoryId: 'cat-vehicles',
      categoryName: 'bikes',
      condition: 'Good',
      city: 'Chennai',
      location: 'Velachery, Chennai',
      postedAt: '5 hours ago',
      imageUrl: '/images/bike_yamaha.jpg',
      images: ['/images/bike_yamaha.jpg'],
      status: 'active',
      views: 98,
      featured: true,
      badge: 'good',
      badgeText: 'Good Condition',
      sellerId: 'usr-2',
    },
    {
      id: 'prod-3',
      title: 'iPhone 13 128GB',
      price: 28000,
      description: 'iPhone 13 128GB Midnight Purple, 89% battery health. Comes with original box, braided lightning cable, and Spigen protective case.',
      categoryId: 'cat-mobiles',
      categoryName: 'mobiles',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Anna Nagar, Chennai',
      postedAt: '1 day ago',
      imageUrl: '/images/phone_purple.jpg',
      images: ['/images/phone_purple.jpg'],
      status: 'active',
      views: 310,
      featured: true,
      badge: 'likenew',
      badgeText: 'Like New',
      sellerId: 'usr-3',
    },
    {
      id: 'prod-4',
      title: '3 Seater Sofa',
      price: 12000,
      description: 'Premium rich brown genuine leatherette 3-seater sofa. Ergonomic cushioned back, sturdy solid wood frame. Pet-free and smoke-free home.',
      categoryId: 'cat-furniture',
      categoryName: 'furniture',
      condition: 'Good',
      city: 'Chennai',
      location: 'Adyar, Chennai',
      postedAt: '1 day ago',
      imageUrl: '/images/sofa_brown.jpg',
      images: ['/images/sofa_brown.jpg'],
      status: 'active',
      views: 84,
      featured: false,
      sellerId: 'usr-4',
    },
    {
      id: 'prod-5',
      title: 'MacBook Air M1 (256GB SSD)',
      price: 45000,
      description: 'Apple MacBook Air M1 (2020), 8GB RAM, 256GB SSD, Space Gray. 94% Battery Health (112 cycles). Spotless body, always used with screen protector.',
      categoryId: 'cat-electronics',
      categoryName: 'electronics',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Koramangala, Bangalore',
      postedAt: '2 days ago',
      imageUrl: '/images/laptop_macbook.jpg',
      images: ['/images/laptop_macbook.jpg'],
      status: 'active',
      views: 420,
      featured: true,
      badge: 'featured',
      badgeText: 'Featured',
      sellerId: 'usr-5',
    },
    {
      id: 'prod-6',
      title: '2 BHK Luxury Apartment',
      price: 7500000,
      description: 'Spacious 2 BHK gated community apartment, 1150 sq.ft, south-facing, covered car parking, 24/7 power backup, swimming pool, gym, clubhouse.',
      categoryId: 'cat-furniture',
      categoryName: 'properties',
      condition: 'Brand New',
      city: 'Chennai',
      location: 'RS Puram, Coimbatore',
      postedAt: '3 days ago',
      imageUrl: '/images/apartment.jpg',
      images: ['/images/apartment.jpg'],
      status: 'active',
      views: 560,
      featured: true,
      badge: 'verified',
      badgeText: 'Verified',
      sellerId: 'usr-6',
    },
    {
      id: 'prod-7',
      title: 'Canon EOS 1500D DSLR + 18-55mm',
      price: 24500,
      description: 'Canon EOS 1500D DSLR with 18-55mm IS STM Lens kit, 64GB Extreme SD Card, original battery, charger, neck strap, and camera bag.',
      categoryId: 'cat-electronics',
      categoryName: 'electronics',
      condition: 'Like New',
      city: 'Chennai',
      location: 'T. Nagar, Chennai',
      postedAt: '4 hours ago',
      imageUrl: '/images/camera.jpg',
      images: ['/images/camera.jpg'],
      status: 'active',
      views: 112,
      featured: false,
      badge: 'likenew',
      badgeText: 'Like New',
      sellerId: 'usr-7',
    },
    {
      id: 'prod-8',
      title: 'Royal Enfield Classic 350',
      price: 135000,
      description: 'Royal Enfield Classic 350 Stealth Black edition. Dual-channel ABS, aftermarket alloy wheels, smooth thump, insured till 2027.',
      categoryId: 'cat-vehicles',
      categoryName: 'bikes',
      condition: 'Good',
      city: 'Chennai',
      location: 'Velachery, Chennai',
      postedAt: '6 hours ago',
      imageUrl: '/images/bike_yamaha.jpg',
      images: ['/images/bike_yamaha.jpg'],
      status: 'active',
      views: 230,
      featured: false,
      sellerId: 'usr-8',
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
