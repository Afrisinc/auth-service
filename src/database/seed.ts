import { logger } from '@/utils/logger.js';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    logger.info('Starting database seeding...');

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create sample users
    logger.info('Creating sample users...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { email: 'john.individual@example.com' },
        update: {},
        create: {
          email: 'john.individual@example.com',
          password_hash: hashedPassword,
          status: 'active',
        },
      }),
      prisma.user.upsert({
        where: { email: 'jane.individual@example.com' },
        update: {},
        create: {
          email: 'jane.individual@example.com',
          password_hash: hashedPassword,
          status: 'active',
        },
      }),
      prisma.user.upsert({
        where: { email: 'org.owner@example.com' },
        update: {},
        create: {
          email: 'org.owner@example.com',
          password_hash: hashedPassword,
          status: 'active',
        },
      }),
      prisma.user.upsert({
        where: { email: 'org.admin@example.com' },
        update: {},
        create: {
          email: 'org.admin@example.com',
          password_hash: hashedPassword,
          status: 'active',
        },
      }),
    ]);

    logger.info(`Created/updated ${users.length} users`);

    // Create sample products
    logger.info('Creating sample products...');
    const products = await Promise.all([
      prisma.product.upsert({
        where: { code: 'notify' },
        update: {},
        create: {
          name: 'Notification Service',
          code: 'notify',
        },
      }),
      prisma.product.upsert({
        where: { code: 'media' },
        update: {},
        create: {
          name: 'Media Service',
          code: 'media',
        },
      }),
      prisma.product.upsert({
        where: { code: 'billing' },
        update: {},
        create: {
          name: 'Billing Service',
          code: 'billing',
        },
      }),
    ]);

    logger.info(`Created/updated ${products.length} products`);

    // Create individual accounts with product enrollments
    logger.info('Creating individual accounts...');
    const johnUser = users[0];
    const janeUser = users[1];

    const johnAccount = await prisma.account.upsert({
      where: { id: johnUser.id + '-individual' },
      update: {},
      create: {
        id: johnUser.id + '-individual',
        type: 'INDIVIDUAL',
        owner_user_id: johnUser.id,
      },
    });

    const janeAccount = await prisma.account.upsert({
      where: { id: janeUser.id + '-individual' },
      update: {},
      create: {
        id: janeUser.id + '-individual',
        type: 'INDIVIDUAL',
        owner_user_id: janeUser.id,
      },
    });

    logger.info('Created 2 individual accounts');

    // Enroll individual accounts in products
    logger.info('Enrolling individual accounts in products...');
    await Promise.all([
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: johnAccount.id,
            product_id: products[0].id,
          },
        },
        update: {},
        create: {
          account_id: johnAccount.id,
          product_id: products[0].id,
          status: 'ACTIVE',
          plan: 'FREE',
          external_resource_id: 'tenant_john_notify_001',
        },
      }),
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: janeAccount.id,
            product_id: products[0].id,
          },
        },
        update: {},
        create: {
          account_id: janeAccount.id,
          product_id: products[0].id,
          status: 'ACTIVE',
          plan: 'PRO',
          external_resource_id: 'tenant_jane_notify_001',
        },
      }),
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: janeAccount.id,
            product_id: products[1].id,
          },
        },
        update: {},
        create: {
          account_id: janeAccount.id,
          product_id: products[1].id,
          status: 'ACTIVE',
          plan: 'FREE',
          external_resource_id: 'tenant_jane_media_001',
        },
      }),
    ]);

    logger.info('Enrolled individual accounts in products');

    // Create organization
    logger.info('Creating sample organization...');
    const organization = await prisma.organization.upsert({
      where: { id: 'acme-org-id' },
      update: {},
      create: {
        id: 'acme-org-id',
        name: 'Acme Corporation',
        legal_name: 'Acme Corporation Inc.',
        country: 'US',
        tax_id: '12-3456789',
      },
    });

    logger.info('Created organization');

    // Create organization account
    logger.info('Creating organization account...');
    const orgOwner = users[2];
    const orgAdmin = users[3];

    const organizationAccount = await prisma.account.upsert({
      where: { id: organization.id + '-account' },
      update: {},
      create: {
        id: organization.id + '-account',
        type: 'ORGANIZATION',
        owner_user_id: orgOwner.id,
        organization_id: organization.id,
      },
    });

    logger.info('Created organization account');

    // Add organization members
    logger.info('Adding organization members...');
    await Promise.all([
      prisma.organizationMember.upsert({
        where: {
          organization_id_user_id: {
            organization_id: organization.id,
            user_id: orgOwner.id,
          },
        },
        update: {},
        create: {
          organization_id: organization.id,
          user_id: orgOwner.id,
          role: 'OWNER',
        },
      }),
      prisma.organizationMember.upsert({
        where: {
          organization_id_user_id: {
            organization_id: organization.id,
            user_id: orgAdmin.id,
          },
        },
        update: {},
        create: {
          organization_id: organization.id,
          user_id: orgAdmin.id,
          role: 'ADMIN',
        },
      }),
    ]);

    logger.info('Added organization members');

    // Enroll organization account in products
    logger.info('Enrolling organization account in products...');
    await Promise.all([
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: organizationAccount.id,
            product_id: products[0].id,
          },
        },
        update: {},
        create: {
          account_id: organizationAccount.id,
          product_id: products[0].id,
          status: 'ACTIVE',
          plan: 'ENTERPRISE',
          external_resource_id: 'tenant_acme_notify_001',
        },
      }),
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: organizationAccount.id,
            product_id: products[1].id,
          },
        },
        update: {},
        create: {
          account_id: organizationAccount.id,
          product_id: products[1].id,
          status: 'ACTIVE',
          plan: 'PRO',
          external_resource_id: 'tenant_acme_media_001',
        },
      }),
    ]);

    logger.info('Enrolled organization account in products');

    logger.info('Database seeding completed successfully!');
    logger.info('');
    logger.info('Sample Users:');
    logger.info('  Individual Account 1: john.individual@example.com');
    logger.info('  Individual Account 2: jane.individual@example.com');
    logger.info('  Organization Owner: org.owner@example.com');
    logger.info('  Organization Admin: org.admin@example.com');
    logger.info('');
    logger.info('Default Password: Password123!');
    logger.info('');
    logger.info('Sample Organization: Acme Corporation');
  } catch (error: any) {
    logger.error('Error seeding database: ' + (error?.message || error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
