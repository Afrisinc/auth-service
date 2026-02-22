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
        update: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0101',
          location: 'New York, NY',
        },
        create: {
          email: 'john.individual@example.com',
          password_hash: hashedPassword,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0101',
          location: 'New York, NY',
          status: 'ACTIVE',
        },
      }),
      prisma.user.upsert({
        where: { email: 'jane.individual@example.com' },
        update: {
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1-555-0102',
          location: 'San Francisco, CA',
        },
        create: {
          email: 'jane.individual@example.com',
          password_hash: hashedPassword,
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+1-555-0102',
          location: 'San Francisco, CA',
          status: 'ACTIVE',
        },
      }),
      prisma.user.upsert({
        where: { email: 'org.owner@example.com' },
        update: {
          firstName: 'Robert',
          lastName: 'Johnson',
          phone: '+1-555-0103',
          location: 'Chicago, IL',
        },
        create: {
          email: 'org.owner@example.com',
          password_hash: hashedPassword,
          firstName: 'Robert',
          lastName: 'Johnson',
          phone: '+1-555-0103',
          location: 'Chicago, IL',
          status: 'ACTIVE',
        },
      }),
      prisma.user.upsert({
        where: { email: 'org.admin@example.com' },
        update: {
          firstName: 'Alice',
          lastName: 'Williams',
          phone: '+1-555-0104',
          location: 'Boston, MA',
        },
        create: {
          email: 'org.admin@example.com',
          password_hash: hashedPassword,
          firstName: 'Alice',
          lastName: 'Williams',
          phone: '+1-555-0104',
          location: 'Boston, MA',
          status: 'ACTIVE',
        },
      }),
      // AfrisInc users
      prisma.user.upsert({
        where: { email: 'amara.okonkwo@afrisinc.com' },
        update: {
          firstName: 'Amara',
          lastName: 'Okonkwo',
          phone: '+234-806-1234567',
          location: 'Lagos, Nigeria',
        },
        create: {
          email: 'amara.okonkwo@afrisinc.com',
          password_hash: hashedPassword,
          firstName: 'Amara',
          lastName: 'Okonkwo',
          phone: '+234-806-1234567',
          location: 'Lagos, Nigeria',
          status: 'ACTIVE',
        },
      }),
      prisma.user.upsert({
        where: { email: 'kwame.mensah@afrisinc.com' },
        update: {
          firstName: 'Kwame',
          lastName: 'Mensah',
          phone: '+233-207-1234567',
          location: 'Accra, Ghana',
        },
        create: {
          email: 'kwame.mensah@afrisinc.com',
          password_hash: hashedPassword,
          firstName: 'Kwame',
          lastName: 'Mensah',
          phone: '+233-207-1234567',
          location: 'Accra, Ghana',
          status: 'ACTIVE',
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
          description:
            'Send and manage notifications across multiple channels including email, SMS, and push notifications',
        },
      }),
      prisma.product.upsert({
        where: { code: 'media' },
        update: {},
        create: {
          name: 'Media Service',
          code: 'media',
          description: 'Upload, store, and manage media files with automatic optimization and delivery',
        },
      }),
      prisma.product.upsert({
        where: { code: 'billing' },
        update: {},
        create: {
          name: 'Billing Service',
          code: 'billing',
          description:
            'Complete billing and invoicing platform with subscription management and payment processing',
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

    // Create organizations
    logger.info('Creating sample organizations...');
    const organization = await prisma.organization.upsert({
      where: { id: 'acme-org-id' },
      update: {
        org_email: 'contact@acme.com',
        org_phone: '+1-555-0200',
        location: '123 Business Ave, New York, NY 10001',
      },
      create: {
        id: 'acme-org-id',
        name: 'Acme Corporation',
        legal_name: 'Acme Corporation Inc.',
        country: 'US',
        tax_id: '12-3456789',
        org_email: 'contact@acme.com',
        org_phone: '+1-555-0200',
        location: '123 Business Ave, New York, NY 10001',
      },
    });

    const afrisinc = await prisma.organization.upsert({
      where: { id: 'afrisinc-org-id' },
      update: {
        org_email: 'info@afrisinc.com',
        org_phone: '+234-1-6292050',
        location: '5, Akin Adesanya Street, Victoria Island, Lagos, Nigeria',
      },
      create: {
        id: 'afrisinc-org-id',
        name: 'AfrisInc',
        legal_name: 'African Solutions and Innovation Company Limited',
        country: 'NG',
        tax_id: 'RC1234567',
        org_email: 'info@afrisinc.com',
        org_phone: '+234-1-6292050',
        location: '5, Akin Adesanya Street, Victoria Island, Lagos, Nigeria',
      },
    });

    logger.info('Created 2 organizations (Acme Corporation and AfrisInc)');

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

    // Create AfrisInc organization account
    logger.info('Creating AfrisInc organization account...');
    const afrisinc_owner = users[4]; // Amara Okonkwo
    const afrisinc_admin = users[5]; // Kwame Mensah

    const afrisincAccount = await prisma.account.upsert({
      where: { id: afrisinc.id + '-account' },
      update: {},
      create: {
        id: afrisinc.id + '-account',
        type: 'ORGANIZATION',
        owner_user_id: afrisinc_owner.id,
        organization_id: afrisinc.id,
      },
    });

    logger.info('Created AfrisInc organization account');

    // Add AfrisInc organization members
    logger.info('Adding AfrisInc organization members...');
    await Promise.all([
      prisma.organizationMember.upsert({
        where: {
          organization_id_user_id: {
            organization_id: afrisinc.id,
            user_id: afrisinc_owner.id,
          },
        },
        update: {},
        create: {
          organization_id: afrisinc.id,
          user_id: afrisinc_owner.id,
          role: 'OWNER',
        },
      }),
      prisma.organizationMember.upsert({
        where: {
          organization_id_user_id: {
            organization_id: afrisinc.id,
            user_id: afrisinc_admin.id,
          },
        },
        update: {},
        create: {
          organization_id: afrisinc.id,
          user_id: afrisinc_admin.id,
          role: 'ADMIN',
        },
      }),
    ]);

    logger.info('Added AfrisInc organization members');

    // Enroll AfrisInc account in products
    logger.info('Enrolling AfrisInc account in products...');
    await Promise.all([
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: afrisincAccount.id,
            product_id: products[0].id,
          },
        },
        update: {},
        create: {
          account_id: afrisincAccount.id,
          product_id: products[0].id,
          status: 'ACTIVE',
          plan: 'ENTERPRISE',
          external_resource_id: 'tenant_afrisinc_notify_001',
        },
      }),
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: afrisincAccount.id,
            product_id: products[1].id,
          },
        },
        update: {},
        create: {
          account_id: afrisincAccount.id,
          product_id: products[1].id,
          status: 'ACTIVE',
          plan: 'PRO',
          external_resource_id: 'tenant_afrisinc_media_001',
        },
      }),
      prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: afrisincAccount.id,
            product_id: products[2].id,
          },
        },
        update: {},
        create: {
          account_id: afrisincAccount.id,
          product_id: products[2].id,
          status: 'ACTIVE',
          plan: 'FREE',
          external_resource_id: 'tenant_afrisinc_billing_001',
        },
      }),
    ]);

    logger.info('Enrolled AfrisInc account in products');

    // Seed login events for analytics testing
    logger.info('Creating sample login events...');
    const loginEventDates = [
      new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
      new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      new Date(), // today
    ];

    const loginEvents = [];
    for (const user of users) {
      for (let i = 0; i < loginEventDates.length; i++) {
        // Mix of successful and failed logins
        const status = Math.random() > 0.1 ? 'success' : 'failed'; // 90% success rate
        loginEvents.push(
          prisma.loginEvent.create({
            data: {
              user_id: user.id,
              status,
              ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
              createdAt: new Date(loginEventDates[i].getTime() + Math.random() * 24 * 60 * 60 * 1000),
            },
          })
        );
      }
    }

    await Promise.all(loginEvents);
    logger.info(`Created ${loginEvents.length} login events for analytics`);

    // Seed login failures for security testing
    logger.info('Creating sample login failures...');
    const failureReasons = ['Invalid password', 'Account locked', 'MFA failed', 'Expired token'];
    const failureIPs = ['192.168.1.105', '10.0.0.88', '172.16.0.42', '203.0.113.15', '198.51.100.3'];
    const loginFailures = [];

    // Create 47 failed login attempts in the last 24 hours
    for (let i = 0; i < 47; i++) {
      const ipIndex = i % failureIPs.length;
      const reasonIndex = Math.floor(Math.random() * failureReasons.length);
      const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

      loginFailures.push(
        prisma.loginFailure.create({
          data: {
            email:
              i % 3 === 0 ? 'attacker@malicious.com' : i % 2 === 0 ? 'user@example.com' : 'user2@example.com',
            ip_address: failureIPs[ipIndex],
            failure_reason: failureReasons[reasonIndex],
            user_id: i % 2 === 0 ? users[0].id : users[1].id,
            createdAt: timestamp,
          },
        })
      );
    }

    await Promise.all(loginFailures);
    logger.info(`Created ${loginFailures.length} login failures for security testing`);

    // Seed tokens for security testing
    logger.info('Creating sample tokens...');
    const tokens = [];

    // Create 1284 tokens distributed across all users
    for (let i = 0; i < 1284; i++) {
      const userIndex = i % users.length;
      const tokenType = ['access', 'refresh', 'api_key'][i % 3];
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

      tokens.push(
        prisma.token.create({
          data: {
            user_id: users[userIndex].id,
            token_type: tokenType,
            expires_at: expiresAt,
            issued_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          },
        })
      );
    }

    await Promise.all(tokens);
    logger.info(`Created ${tokens.length} tokens for security testing`);

    logger.info('Database seeding completed successfully!');
    logger.info('');
    logger.info('=== INDIVIDUAL ACCOUNTS ===');
    logger.info('Account 1:');
    logger.info('  Email: john.individual@example.com');
    logger.info('  Name: John Doe');
    logger.info('  Phone: +1-555-0101');
    logger.info('  Location: New York, NY');
    logger.info('');
    logger.info('Account 2:');
    logger.info('  Email: jane.individual@example.com');
    logger.info('  Name: Jane Smith');
    logger.info('  Phone: +1-555-0102');
    logger.info('  Location: San Francisco, CA');
    logger.info('');
    logger.info('=== ACME CORPORATION ===');
    logger.info('Organization Owner:');
    logger.info('  Email: org.owner@example.com');
    logger.info('  Name: Robert Johnson');
    logger.info('  Phone: +1-555-0103');
    logger.info('  Location: Chicago, IL');
    logger.info('');
    logger.info('Organization Admin:');
    logger.info('  Email: org.admin@example.com');
    logger.info('  Name: Alice Williams');
    logger.info('  Phone: +1-555-0104');
    logger.info('  Location: Boston, MA');
    logger.info('');
    logger.info('Organization Details:');
    logger.info('  Name: Acme Corporation');
    logger.info('  Email: contact@acme.com');
    logger.info('  Phone: +1-555-0200');
    logger.info('  Location: 123 Business Ave, New York, NY 10001');
    logger.info('  Tax ID: 12-3456789');
    logger.info('');
    logger.info('=== AFRISINC ===');
    logger.info('Organization Owner:');
    logger.info('  Email: amara.okonkwo@afrisinc.com');
    logger.info('  Name: Amara Okonkwo');
    logger.info('  Phone: +234-806-1234567');
    logger.info('  Location: Lagos, Nigeria');
    logger.info('');
    logger.info('Organization Admin:');
    logger.info('  Email: kwame.mensah@afrisinc.com');
    logger.info('  Name: Kwame Mensah');
    logger.info('  Phone: +233-207-1234567');
    logger.info('  Location: Accra, Ghana');
    logger.info('');
    logger.info('Organization Details:');
    logger.info('  Name: AfrisInc');
    logger.info('  Legal Name: African Solutions and Innovation Company Limited');
    logger.info('  Email: info@afrisinc.com');
    logger.info('  Phone: +234-1-6292050');
    logger.info('  Location: 5, Akin Adesanya Street, Victoria Island, Lagos, Nigeria');
    logger.info('  Tax ID: RC1234567');
    logger.info('');
    logger.info('=== LOGIN CREDENTIALS ===');
    logger.info('Default Password (all users): Password123!');
  } catch (error: any) {
    logger.error('Error seeding database: ' + (error?.message || error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
