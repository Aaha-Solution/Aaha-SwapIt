import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SwapIt database seeding...');

  // 1. Create Demo Admin, Seller, and Customer
  const passwordHash = await bcrypt.hash('Password@123', 10);

  // Admin Account
  const demoAdmin = await prisma.user.upsert({
    where: { email: 'admin@swapit.com' },
    update: { role: 'admin' },
    create: {
      id: 'usr-demo-admin',
      email: 'admin@swapit.com',
      password: passwordHash,
      name: 'Iyyanar (Admin)',
      phone: '+91 98401 98765',
      location: 'Puducherry',
      verified: true,
      role: 'admin',
      memberSince: 'Sep 2024',
    },
  });

  // Legacy demo user email also mapped to admin
  await prisma.user.upsert({
    where: { email: 'iyyanar@example.com' },
    update: { role: 'admin' },
    create: {
      id: 'usr-demo-iyyanar',
      email: 'iyyanar@example.com',
      password: passwordHash,
      name: 'Iyyanar',
      phone: '+91 98401 98765',
      location: 'Puducherry',
      verified: true,
      role: 'admin',
      memberSince: 'Sep 2024',
    },
  });

  // Demo Customer Account (Buyer)
  await prisma.user.upsert({
    where: { email: 'customer@swapit.com' },
    update: { role: 'customer' },
    create: {
      id: 'usr-demo-customer',
      email: 'customer@swapit.com',
      password: passwordHash,
      name: 'Vignesh (Customer)',
      phone: '+91 97910 88231',
      location: 'Puducherry',
      verified: true,
      role: 'customer',
      memberSince: 'Jan 2025',
    },
  });

  // Demo Primary Seller Account (Created by Admin)
  await prisma.user.upsert({
    where: { email: 'seller@swapit.com' },
    update: { role: 'seller' },
    create: {
      id: 'usr-demo-seller',
      email: 'seller@swapit.com',
      password: passwordHash,
      name: 'Karthik Raja (Seller)',
      phone: '+91 98401 23456',
      location: 'Puducherry',
      verified: true,
      role: 'seller',
      memberSince: 'Oct 2024',
    },
  });

  const sellers = [
    { id: 'usr-1', name: 'Karthik Raja', email: 'karthik@example.com', phone: '+91 98401 23456', location: 'White Town, Puducherry', role: 'seller' },
    { id: 'usr-2', name: 'Suresh Motors', email: 'suresh@example.com', phone: '+91 94441 55210', location: 'Lawspet, Puducherry', role: 'seller' },
    { id: 'usr-3', name: 'Ananya Ramesh', email: 'ananya@example.com', phone: '+91 98840 76543', location: 'Muthialpet, Puducherry', role: 'seller' },
    { id: 'usr-4', name: 'Deepak Nathan', email: 'deepak@example.com', phone: '+91 99620 11984', location: 'Heritage Town, Puducherry', role: 'seller' },
    { id: 'usr-5', name: 'Apex Realtors', email: 'apex@example.com', phone: '+91 98410 99882', location: 'Reddiarpalayam, Puducherry', role: 'seller' },
    { id: 'usr-6', name: 'Pravin Studio', email: 'pravin@example.com', phone: '+91 91760 33419', location: 'Gorimedu, Puducherry', role: 'seller' },
    { id: 'usr-7', name: 'Pondy Bikers', email: 'pondybikers@example.com', phone: '+91 98402 11223', location: 'Nellithope, Puducherry', role: 'seller' },
    { id: 'usr-8', name: 'Balaji S', email: 'balaji@example.com', phone: '+91 90030 45612', location: 'Mudaliarpet, Puducherry', role: 'seller' },
    { id: 'usr-9', name: 'Vogue Boutique', email: 'vogue@example.com', phone: '+91 98403 33445', location: 'Ariyankuppam, Puducherry', role: 'seller' },
    { id: 'usr-10', name: 'Aqua Reef Pets', email: 'aquareef@example.com', phone: '+91 98404 55667', location: 'Villiyanur, Puducherry', role: 'seller' },
    { id: 'usr-11', name: 'Puducherry Clean Pro', email: 'cleanpro@example.com', phone: '+91 98405 77889', location: 'Kalapet, Puducherry', role: 'seller' },
  ];

  for (const s of sellers) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: s.email } });
    if (existingByEmail && existingByEmail.id !== s.id) {
      await prisma.user.delete({ where: { id: existingByEmail.id } });
    }
    await prisma.user.upsert({
      where: { id: s.id },
      update: { name: s.name, email: s.email, phone: s.phone, location: s.location, role: s.role },
      create: {
        id: s.id,
        email: s.email,
        password: passwordHash,
        name: s.name,
        phone: s.phone,
        location: s.location,
        verified: true,
        role: s.role,
        memberSince: 'Oct 2024',
      },
    });
  }

  console.log('✅ Demo Admin, Sellers, and Customer seeded');

  // 2. Categories (counts reset to 0)
  const categoriesData = [
    { id: 'cat-cars', name: 'Cars', slug: 'cars', icon: 'Car', count: 0 },
    { id: 'cat-bikes', name: 'Bikes', slug: 'bikes', icon: 'Bike', count: 0 },
    { id: 'cat-mobiles', name: 'Mobiles & Tablets', slug: 'mobiles', icon: 'Smartphone', count: 0 },
    { id: 'cat-electronics', name: 'Electronics', slug: 'electronics', icon: 'Tv', count: 0 },
    { id: 'cat-properties', name: 'Properties', slug: 'properties', icon: 'Building2', count: 0 },
    { id: 'cat-furniture', name: 'Furniture', slug: 'furniture', icon: 'Armchair', count: 0 },
    { id: 'cat-fashion', name: 'Fashion', slug: 'fashion', icon: 'Shirt', count: 0 },
    { id: 'cat-pets', name: 'Pets', slug: 'pets', icon: 'Dog', count: 0 },
    { id: 'cat-books', name: 'Books & Hobbies', slug: 'books', icon: 'BookOpen', count: 0 },
    { id: 'cat-services', name: 'Services', slug: 'services', icon: 'Wrench', count: 0 },
    { id: 'cat-jobs', name: 'Jobs', slug: 'jobs', icon: 'Briefcase', count: 0 },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, count: cat.count },
      create: cat,
    });
  }
  console.log('✅ Categories seeded with 0 count');

  console.log('🎉 Database seeding completed successfully (Clean - 0 mock products)!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
