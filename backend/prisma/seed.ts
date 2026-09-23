import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SwapIt database seeding...');

  // 1. Create Demo Admin & Users
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
    { id: 'usr-9', name: 'Ritu Verma', email: 'ritu@example.com', phone: '+91 98200 44556', location: 'Chennai' },
    { id: 'usr-10', name: 'Dr. Pet Haven', email: 'pethaven@example.com', phone: '+91 98111 22334', location: 'Chennai' },
    { id: 'usr-11', name: 'QuickFix Pro', email: 'quickfix@example.com', phone: '+91 99400 11223', location: 'Chennai' },
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
    { id: 'cat-cars', name: 'Cars', slug: 'cars', icon: 'Car', count: 42 },
    { id: 'cat-bikes', name: 'Bikes', slug: 'bikes', icon: 'Bike', count: 28 },
    { id: 'cat-mobiles', name: 'Mobiles & Tablets', slug: 'mobiles', icon: 'Smartphone', count: 65 },
    { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: 'Tv', count: 37 },
    { id: 'cat-properties', name: 'Properties', slug: 'properties', icon: 'Building2', count: 19 },
    { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', icon: 'Armchair', count: 53 },
    { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', icon: 'Shirt', count: 88 },
    { id: 'cat-pets', name: 'Pets', slug: 'pets', icon: 'Dog', count: 15 },
    { id: 'cat-books', name: 'Books & Hobbies', slug: 'books', icon: 'BookOpen', count: 40 },
    { id: 'cat-services', name: 'Services', slug: 'services', icon: 'Wrench', count: 22 },
    { id: 'cat-jobs', name: 'Jobs', slug: 'jobs', icon: 'Briefcase', count: 14 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, count: cat.count },
      create: cat,
    });
  }
  console.log('✅ Categories seeded');

  // 3. Products across ALL categories
  const productsData = [
    // Cars
    {
      id: 'prod-1',
      title: 'Maruti Swift 2019',
      price: 450000,
      description: 'Single owner, pristine condition, full service history at authorized Maruti center. Driven 42,000 km. Comprehensive insurance valid till Dec 2026.',
      categoryId: 'cat-cars',
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
    // Bikes
    {
      id: 'prod-2',
      title: 'Yamaha FZ',
      price: 85000,
      description: 'Yamaha FZ Version 3.0 in racing blue. Brand new rear Michelin tire, smooth engine, no accident history. All papers clear.',
      categoryId: 'cat-bikes',
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
    // Mobiles
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
    // Furniture
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
    // Electronics
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
    // Properties
    {
      id: 'prod-6',
      title: '2 BHK Luxury Apartment',
      price: 7500000,
      description: 'Spacious 2 BHK gated community apartment, 1150 sq.ft, south-facing, covered car parking, 24/7 power backup, swimming pool, gym, clubhouse.',
      categoryId: 'cat-properties',
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
    // Camera
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
    // Bikes 2
    {
      id: 'prod-8',
      title: 'Royal Enfield Classic 350',
      price: 135000,
      description: 'Royal Enfield Classic 350 Stealth Black edition. Dual-channel ABS, aftermarket alloy wheels, smooth thump, insured till 2027.',
      categoryId: 'cat-bikes',
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
    // Fashion
    {
      id: 'prod-9',
      title: 'Vintage Leather Biker Jacket',
      price: 3499,
      description: 'Pure brown leather biker jacket, Size L. Heavy-duty YKK zippers, quilted inner lining, timeless classic look with zero tears.',
      categoryId: 'cat-fashion',
      categoryName: 'fashion',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Nungambakkam, Chennai',
      postedAt: '3 hours ago',
      imageUrl: '/images/fashion.jpg',
      images: ['/images/fashion.jpg'],
      status: 'active',
      views: 75,
      featured: true,
      badge: 'featured',
      badgeText: 'Featured',
      sellerId: 'usr-9',
    },
    {
      id: 'prod-10',
      title: 'Fossil Townsman Automatic Watch',
      price: 7999,
      description: 'Original Fossil Townsman skeleton automatic dial watch with genuine black leather strap. Comes with luxury metal tin box & warranty card.',
      categoryId: 'cat-fashion',
      categoryName: 'fashion',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Alwarpet, Chennai',
      postedAt: '1 day ago',
      imageUrl: '/images/fashion.png',
      images: ['/images/fashion.png'],
      status: 'active',
      views: 140,
      featured: false,
      badge: 'likenew',
      badgeText: 'Like New',
      sellerId: 'usr-9',
    },
    // Pets
    {
      id: 'prod-11',
      title: 'Aquascaped Glass Fish Tank (20 Gallons)',
      price: 4800,
      description: 'Complete rimless 20-gallon aquarium setup with high-output LED plant grow lights, canister filter, dragon stones, and live aquatic plants.',
      categoryId: 'cat-pets',
      categoryName: 'pets',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Mylapore, Chennai',
      postedAt: '12 hours ago',
      imageUrl: '/images/pet.jpg',
      images: ['/images/pet.jpg'],
      status: 'active',
      views: 62,
      featured: false,
      sellerId: 'usr-10',
    },
    // Books & Hobbies
    {
      id: 'prod-12',
      title: 'Yamaha F310 Acoustic Guitar',
      price: 6500,
      description: 'Yamaha F310 natural spruce acoustic guitar. Rich tone, low action strings for effortless playing. Includes padded gig bag, capo & extra DAddario strings.',
      categoryId: 'cat-books',
      categoryName: 'books',
      condition: 'Like New',
      city: 'Chennai',
      location: 'Besant Nagar, Chennai',
      postedAt: '1 day ago',
      imageUrl: '/images/books.jpg',
      images: ['/images/books.jpg'],
      status: 'active',
      views: 95,
      featured: true,
      badge: 'featured',
      badgeText: 'Featured',
      sellerId: 'usr-7',
    },
    // Services
    {
      id: 'prod-13',
      title: 'Professional Home Deep Cleaning & Sanitization',
      price: 1999,
      description: 'Full house deep cleaning by trained experts: kitchen degreasing, bathroom scrubbing, sofa shampooing, floor polishing with eco-friendly solutions.',
      categoryId: 'cat-services',
      categoryName: 'services',
      condition: 'Brand New',
      city: 'Chennai',
      location: 'All Areas, Chennai',
      postedAt: 'Just now',
      imageUrl: '/images/services.jpg',
      images: ['/images/services.jpg'],
      status: 'active',
      views: 180,
      featured: true,
      badge: 'verified',
      badgeText: 'Verified Pro',
      sellerId: 'usr-11',
    },
    // Jobs
    {
      id: 'prod-14',
      title: 'Senior Frontend React / TypeScript Developer',
      price: 85000,
      description: 'Hiring full-time React & TypeScript engineer for high-growth tech startup. Remote or hybrid Chennai office with competitive pay and stock options.',
      categoryId: 'cat-jobs',
      categoryName: 'jobs',
      condition: 'Brand New',
      city: 'Chennai',
      location: 'OMR, Chennai',
      postedAt: '2 days ago',
      imageUrl: '/images/jobs.jpg',
      images: ['/images/jobs.jpg'],
      status: 'active',
      views: 290,
      featured: true,
      badge: 'featured',
      badgeText: 'Hiring Now',
      sellerId: 'usr-1',
    },
  ];

  for (const prod of productsData) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: prod,
      create: prod,
    });
  }
  console.log('✅ Products across all categories seeded');

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
