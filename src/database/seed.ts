import { logger } from '@/utils/logger.js';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    logger.info('Starting database seeding...');

    // Optional: Clear existing users
    // await prisma.user.deleteMany({});

    // Create sample users
    logger.info('Creating sample users...');
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          email: 'admin@example.com',
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          phone: '+1-800-ADMIN',
          role: 'ADMIN',
        },
      }),
      prisma.user.upsert({
        where: { email: 'support@example.com' },
        update: {},
        create: {
          email: 'support@example.com',
          password: hashedPassword,
          firstName: 'Support',
          lastName: 'Team',
          phone: '+1-800-SUPPORT',
          role: 'SUPPORT',
        },
      }),
      prisma.user.upsert({
        where: { email: 'seller@example.com' },
        update: {},
        create: {
          email: 'seller@example.com',
          password: hashedPassword,
          firstName: 'John',
          lastName: 'Seller',
          phone: '+1-800-SELLER',
          role: 'SELLER',
        },
      }),
      prisma.user.upsert({
        where: { email: 'buyer@example.com' },
        update: {},
        create: {
          email: 'buyer@example.com',
          password: hashedPassword,
          firstName: 'Jane',
          lastName: 'Buyer',
          phone: '+1-800-BUYER',
          role: 'BUYER',
        },
      }),
    ]);

    logger.info(`Created/updated ${users.length} users`);
    logger.info('Database seeding completed successfully!');
  } catch (error: any) {
    logger.error('Error seeding database: ' + (error?.message || error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
