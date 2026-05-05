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

    // Add organization members - will be updated by RBAC seeding to use role_id
    // logger.info('Adding organization members...');
    // await Promise.all([...]);
    // logger.info('Added organization members');

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

    // Add AfrisInc organization members - will be updated by RBAC seeding to use role_id
    // logger.info('Adding AfrisInc organization members...');
    // await Promise.all([...]);
    // logger.info('Added AfrisInc organization members');

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

    // ========== SEED RBAC DATA ==========
    logger.info('Seeding RBAC system...');

    // 1. CREATE ROLES
    logger.info('Creating roles...');
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: 'SUPER_ADMIN' },
        update: { description: 'Full system access and control' },
        create: {
          name: 'SUPER_ADMIN',
          description: 'Full system access and control',
        },
      }),
      prisma.role.upsert({
        where: { name: 'OPS_MANAGER' },
        update: { description: 'Operations and infrastructure management' },
        create: {
          name: 'OPS_MANAGER',
          description: 'Operations and infrastructure management',
        },
      }),
      prisma.role.upsert({
        where: { name: 'FINANCE_ADMIN' },
        update: { description: 'Financial management and billing' },
        create: {
          name: 'FINANCE_ADMIN',
          description: 'Financial management and billing',
        },
      }),
      prisma.role.upsert({
        where: { name: 'PRODUCT_MANAGER' },
        update: { description: 'Product planning and feature management' },
        create: {
          name: 'PRODUCT_MANAGER',
          description: 'Product planning and feature management',
        },
      }),
      prisma.role.upsert({
        where: { name: 'SUPPORT_LEAD' },
        update: { description: 'Lead support operations and team management' },
        create: {
          name: 'SUPPORT_LEAD',
          description: 'Lead support operations and team management',
        },
      }),
      prisma.role.upsert({
        where: { name: 'SUPPORT_AGENT' },
        update: { description: 'Handle customer support tickets' },
        create: {
          name: 'SUPPORT_AGENT',
          description: 'Handle customer support tickets',
        },
      }),
      prisma.role.upsert({
        where: { name: 'TECHNICAL_AGENT' },
        update: { description: 'Technical support and troubleshooting' },
        create: {
          name: 'TECHNICAL_AGENT',
          description: 'Technical support and troubleshooting',
        },
      }),
      prisma.role.upsert({
        where: { name: 'ANALYST' },
        update: { description: 'Data analysis and reporting' },
        create: {
          name: 'ANALYST',
          description: 'Data analysis and reporting',
        },
      }),
    ]);
    logger.info(`Created/updated ${roles.length} roles`);

    // 2. CREATE PERMISSIONS
    logger.info('Creating permissions...');
    const permissions = await Promise.all([
      // Dashboard & Analytics
      prisma.permission.upsert({
        where: { name: 'view_dashboard' },
        update: {},
        create: {
          name: 'view_dashboard',
          description: 'View main dashboard',
          category: 'dashboard',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_analytics' },
        update: {},
        create: {
          name: 'view_analytics',
          description: 'View analytics and reports',
          category: 'analytics',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'export_reports' },
        update: {},
        create: {
          name: 'export_reports',
          description: 'Export analytics reports',
          category: 'analytics',
        },
      }),

      // User Management
      prisma.permission.upsert({
        where: { name: 'manage_users' },
        update: {},
        create: {
          name: 'manage_users',
          description: 'Create, update, delete users',
          category: 'user_management',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_users' },
        update: {},
        create: {
          name: 'view_users',
          description: 'View user list and details',
          category: 'user_management',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_roles' },
        update: {},
        create: {
          name: 'manage_roles',
          description: 'Create, update, delete roles',
          category: 'user_management',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_permissions' },
        update: {},
        create: {
          name: 'manage_permissions',
          description: 'Manage system permissions',
          category: 'user_management',
        },
      }),

      // Organization Management
      prisma.permission.upsert({
        where: { name: 'manage_organization' },
        update: {},
        create: {
          name: 'manage_organization',
          description: 'Manage organization settings',
          category: 'organization',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_members' },
        update: {},
        create: {
          name: 'manage_members',
          description: 'Add/remove organization members',
          category: 'organization',
        },
      }),

      // Billing & Finance
      prisma.permission.upsert({
        where: { name: 'view_billing' },
        update: {},
        create: {
          name: 'view_billing',
          description: 'View billing information',
          category: 'billing',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_billing' },
        update: {},
        create: {
          name: 'manage_billing',
          description: 'Manage billing and invoices',
          category: 'billing',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_subscriptions' },
        update: {},
        create: {
          name: 'manage_subscriptions',
          description: 'Manage product subscriptions',
          category: 'billing',
        },
      }),

      // Support & Tickets
      prisma.permission.upsert({
        where: { name: 'view_tickets' },
        update: {},
        create: {
          name: 'view_tickets',
          description: 'View support tickets',
          category: 'support',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_tickets' },
        update: {},
        create: {
          name: 'manage_tickets',
          description: 'Create, update, resolve tickets',
          category: 'support',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'respond_tickets' },
        update: {},
        create: {
          name: 'respond_tickets',
          description: 'Respond to support tickets',
          category: 'support',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'escalate_tickets' },
        update: {},
        create: {
          name: 'escalate_tickets',
          description: 'Escalate support tickets',
          category: 'support',
        },
      }),

      // Customer Management
      prisma.permission.upsert({
        where: { name: 'view_customers' },
        update: {},
        create: {
          name: 'view_customers',
          description: 'View customer information',
          category: 'customer',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'edit_customers' },
        update: {},
        create: {
          name: 'edit_customers',
          description: 'Edit customer information',
          category: 'customer',
        },
      }),

      // User Assignment
      prisma.permission.upsert({
        where: { name: 'assign_users' },
        update: {},
        create: {
          name: 'assign_users',
          description: 'Assign users to products',
          category: 'user_management',
        },
      }),

      // Product Management
      prisma.permission.upsert({
        where: { name: 'manage_products' },
        update: {},
        create: {
          name: 'manage_products',
          description: 'Manage products and features',
          category: 'product',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_products' },
        update: {},
        create: {
          name: 'view_products',
          description: 'View product information',
          category: 'product',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'create_products' },
        update: {},
        create: {
          name: 'create_products',
          description: 'Create new products',
          category: 'product',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_all_products' },
        update: {},
        create: {
          name: 'view_all_products',
          description: 'View all products across organization',
          category: 'product',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'configure_product' },
        update: {},
        create: {
          name: 'configure_product',
          description: 'Configure product settings',
          category: 'product',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'access_api_keys' },
        update: {},
        create: {
          name: 'access_api_keys',
          description: 'Access and manage API keys',
          category: 'product',
        },
      }),

      // System Settings
      prisma.permission.upsert({
        where: { name: 'manage_system_settings' },
        update: {},
        create: {
          name: 'manage_system_settings',
          description: 'Manage system configuration',
          category: 'settings',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_logs' },
        update: {},
        create: {
          name: 'view_logs',
          description: 'View system and audit logs',
          category: 'settings',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_audit' },
        update: {},
        create: {
          name: 'view_audit',
          description: 'View audit log',
          category: 'settings',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'manage_security' },
        update: {},
        create: {
          name: 'manage_security',
          description: 'Manage security settings',
          category: 'settings',
        },
      }),

      // Analytics & Export
      prisma.permission.upsert({
        where: { name: 'export_data' },
        update: {},
        create: {
          name: 'export_data',
          description: 'Export data in bulk',
          category: 'analytics',
        },
      }),
      prisma.permission.upsert({
        where: { name: 'view_reports' },
        update: {},
        create: {
          name: 'view_reports',
          description: 'View reports and analytics',
          category: 'analytics',
        },
      }),
    ]);
    logger.info(`Created/updated ${permissions.length} permissions`);

    // 3. CREATE SIDEBAR ITEMS (parents first, then children)
    logger.info('Creating sidebar items...');

    // Stage 1: Create top-level items
    const topLevelItems = await Promise.all([
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-dashboard' },
        update: {},
        create: { id: 'sidebar-dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard', order: 1, isActive: true, parentId: null },
      }),
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-users' },
        update: {},
        create: { id: 'sidebar-users', label: 'Users', icon: 'users', path: '/users', order: 2, isActive: true, parentId: null },
      }),
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-organization' },
        update: {},
        create: { id: 'sidebar-organization', label: 'Organization', icon: 'building', path: '/organization', order: 3, isActive: true, parentId: null },
      }),
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-billing' },
        update: {},
        create: { id: 'sidebar-billing', label: 'Billing', icon: 'credit-card', path: '/billing', order: 4, isActive: true, parentId: null },
      }),
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-support' },
        update: {},
        create: { id: 'sidebar-support', label: 'Support', icon: 'headphones', path: '/support', order: 5, isActive: true, parentId: null },
      }),
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-products' },
        update: {},
        create: { id: 'sidebar-products', label: 'Products', icon: 'box', path: '/products', order: 6, isActive: true, parentId: null },
      }),
      prisma.sidebarItem.upsert({
        where: { id: 'sidebar-settings' },
        update: {},
        create: { id: 'sidebar-settings', label: 'Settings', icon: 'settings', path: '/settings', order: 7, isActive: true, parentId: null },
      }),
    ]);

    // Stage 2: Create child items after parents exist
    const childItems = await Promise.all([
      // Sub-items for Users
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-users-all' }, update: {}, create: { id: 'sidebar-users-all', label: 'All Users', icon: 'list', path: '/users/all', order: 1, isActive: true, parentId: 'sidebar-users' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-users-roles' }, update: {}, create: { id: 'sidebar-users-roles', label: 'Roles', icon: 'shield', path: '/users/roles', order: 2, isActive: true, parentId: 'sidebar-users' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-users-permissions' }, update: {}, create: { id: 'sidebar-users-permissions', label: 'Permissions', icon: 'lock', path: '/users/permissions', order: 3, isActive: true, parentId: 'sidebar-users' } }),
      // Sub-items for Organization
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-org-info' }, update: {}, create: { id: 'sidebar-org-info', label: 'Organization Info', icon: 'info', path: '/organization/info', order: 1, isActive: true, parentId: 'sidebar-organization' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-org-members' }, update: {}, create: { id: 'sidebar-org-members', label: 'Members', icon: 'users-group', path: '/organization/members', order: 2, isActive: true, parentId: 'sidebar-organization' } }),
      // Sub-items for Billing
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-billing-invoices' }, update: {}, create: { id: 'sidebar-billing-invoices', label: 'Invoices', icon: 'receipt', path: '/billing/invoices', order: 1, isActive: true, parentId: 'sidebar-billing' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-billing-subscriptions' }, update: {}, create: { id: 'sidebar-billing-subscriptions', label: 'Subscriptions', icon: 'repeat', path: '/billing/subscriptions', order: 2, isActive: true, parentId: 'sidebar-billing' } }),
      // Sub-items for Support
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-support-tickets' }, update: {}, create: { id: 'sidebar-support-tickets', label: 'Tickets', icon: 'ticket', path: '/support/tickets', order: 1, isActive: true, parentId: 'sidebar-support' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-support-kb' }, update: {}, create: { id: 'sidebar-support-kb', label: 'Knowledge Base', icon: 'book', path: '/support/knowledge-base', order: 2, isActive: true, parentId: 'sidebar-support' } }),
      // Sub-items for Settings
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-settings-system' }, update: {}, create: { id: 'sidebar-settings-system', label: 'System', icon: 'sliders', path: '/settings/system', order: 1, isActive: true, parentId: 'sidebar-settings' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-settings-security' }, update: {}, create: { id: 'sidebar-settings-security', label: 'Security', icon: 'shield-alert', path: '/settings/security', order: 2, isActive: true, parentId: 'sidebar-settings' } }),
      prisma.sidebarItem.upsert({ where: { id: 'sidebar-settings-logs' }, update: {}, create: { id: 'sidebar-settings-logs', label: 'Logs', icon: 'file-text', path: '/settings/logs', order: 3, isActive: true, parentId: 'sidebar-settings' } }),
    ]);

    const sidebarItems = [...topLevelItems, ...childItems];
    logger.info(`Created/updated ${sidebarItems.length} sidebar items`);

    // 4. ASSIGN PERMISSIONS TO ROLES
    logger.info('Assigning permissions to roles...');

    // SUPER_ADMIN: All permissions
    const superAdminPerms = permissions.map(p => ({ role_id: roles[0].id, permission_id: p.id }));

    // OPS_MANAGER: Operations, products, customers, users assignment
    const opsPerms = permissions
      .filter(p => {
        const isAllowed = ['dashboard', 'analytics', 'settings', 'product', 'customer'].includes(p.category || '');
        const isSpecific = ['view_all_products', 'assign_users', 'export_data'].includes(p.name || '');
        return isAllowed || isSpecific;
      })
      .map(p => ({ role_id: roles[1].id, permission_id: p.id }));

    // FINANCE_ADMIN: Billing and analytics only
    const financePerms = permissions
      .filter(p => ['dashboard', 'billing', 'analytics'].includes(p.category || ''))
      .map(p => ({ role_id: roles[2].id, permission_id: p.id }));

    // PRODUCT_MANAGER: Products, customers, analytics, support
    const productPerms = permissions
      .filter(p => {
        const isAllowed = ['dashboard', 'product', 'analytics', 'support', 'customer'].includes(p.category || '');
        const isSpecific = ['configure_product', 'view_reports'].includes(p.name || '');
        return isAllowed || isSpecific;
      })
      .map(p => ({ role_id: roles[3].id, permission_id: p.id }));

    // SUPPORT_LEAD: Support, customers, analytics, user management
    const supportLeadPerms = permissions
      .filter(p => {
        const isAllowed = ['dashboard', 'support', 'user_management', 'analytics', 'customer'].includes(p.category || '');
        const isSpecific = ['respond_tickets', 'escalate_tickets', 'view_reports'].includes(p.name || '');
        return isAllowed || isSpecific;
      })
      .map(p => ({ role_id: roles[4].id, permission_id: p.id }));

    // SUPPORT_AGENT: Support and customer info
    const supportAgentPerms = permissions
      .filter(p => {
        const isAllowed = p.category === 'dashboard' || p.category === 'support' || p.category === 'customer';
        const isSpecific = ['respond_tickets', 'escalate_tickets'].includes(p.name || '');
        return isAllowed || isSpecific;
      })
      .map(p => ({ role_id: roles[5].id, permission_id: p.id }));

    // TECHNICAL_AGENT: Support, API keys, settings, customer info
    const technicalPerms = permissions
      .filter(p => {
        const isAllowed = ['dashboard', 'support', 'settings', 'customer'].includes(p.category || '');
        const isSpecific = ['access_api_keys', 'respond_tickets'].includes(p.name || '');
        return isAllowed || isSpecific;
      })
      .map(p => ({ role_id: roles[6].id, permission_id: p.id }));

    // ANALYST: Dashboard, customers, analytics, audit logs
    const analystPerms = permissions
      .filter(p => {
        const isAllowed = ['dashboard', 'analytics', 'customer'].includes(p.category || '');
        const isSpecific = ['view_reports', 'view_audit', 'export_data'].includes(p.name || '');
        return isAllowed || isSpecific;
      })
      .map(p => ({ role_id: roles[7].id, permission_id: p.id }));

    const allRolePermissions = [
      ...superAdminPerms,
      ...opsPerms,
      ...financePerms,
      ...productPerms,
      ...supportLeadPerms,
      ...supportAgentPerms,
      ...technicalPerms,
      ...analystPerms,
    ];

    await prisma.rolePermission.deleteMany({});
    await prisma.rolePermission.createMany({
      data: allRolePermissions,
      skipDuplicates: true,
    });
    logger.info(`Assigned ${allRolePermissions.length} permission-role mappings`);

    // 5. ASSIGN SIDEBAR ITEMS TO ROLES
    logger.info('Assigning sidebar items to roles...');

    // SUPER_ADMIN: All items
    const superAdminSidebar = sidebarItems.map(item => ({
      role_id: roles[0].id,
      sidebar_item_id: item.id,
    }));

    // OPS_MANAGER: Dashboard, Products, Settings
    const opsSidebar = sidebarItems
      .filter(item => ['sidebar-dashboard', 'sidebar-products', 'sidebar-settings'].includes(item.id))
      .map(item => ({ role_id: roles[1].id, sidebar_item_id: item.id }));

    // FINANCE_ADMIN: Dashboard, Billing
    const financeSidebar = sidebarItems
      .filter(item => ['sidebar-dashboard', 'sidebar-billing'].includes(item.id) || item.parentId === 'sidebar-billing')
      .map(item => ({ role_id: roles[2].id, sidebar_item_id: item.id }));

    // PRODUCT_MANAGER: Dashboard, Products
    const productSidebar = sidebarItems
      .filter(item => ['sidebar-dashboard', 'sidebar-products'].includes(item.id))
      .map(item => ({ role_id: roles[3].id, sidebar_item_id: item.id }));

    // SUPPORT_LEAD: Dashboard, Support, Users
    const supportLeadSidebar = sidebarItems
      .filter(item => ['sidebar-dashboard', 'sidebar-support', 'sidebar-users'].includes(item.id) || item.parentId === 'sidebar-support' || item.parentId === 'sidebar-users')
      .map(item => ({ role_id: roles[4].id, sidebar_item_id: item.id }));

    // SUPPORT_AGENT: Dashboard, Support (Tickets only)
    const supportAgentSidebar = sidebarItems
      .filter(item => item.id === 'sidebar-dashboard' || item.id === 'sidebar-support-tickets')
      .map(item => ({ role_id: roles[5].id, sidebar_item_id: item.id }));

    // TECHNICAL_AGENT: Dashboard, Support, Settings
    const technicalSidebar = sidebarItems
      .filter(item => ['sidebar-dashboard', 'sidebar-support', 'sidebar-settings'].includes(item.id) || item.parentId === 'sidebar-support')
      .map(item => ({ role_id: roles[6].id, sidebar_item_id: item.id }));

    // ANALYST: Dashboard only
    const analystSidebar = sidebarItems
      .filter(item => item.id === 'sidebar-dashboard')
      .map(item => ({ role_id: roles[7].id, sidebar_item_id: item.id }));

    const allRoleSidebars = [
      ...superAdminSidebar,
      ...opsSidebar,
      ...financeSidebar,
      ...productSidebar,
      ...supportLeadSidebar,
      ...supportAgentSidebar,
      ...technicalSidebar,
      ...analystSidebar,
    ];

    await prisma.roleSidebarItem.deleteMany({});
    await prisma.roleSidebarItem.createMany({
      data: allRoleSidebars,
      skipDuplicates: true,
    });
    logger.info(`Assigned ${allRoleSidebars.length} sidebar-role mappings`);

    // 6. UPDATE EXISTING ORGANIZATION MEMBERS TO USE role_id
    logger.info('Updating organization members with new role_id...');

    // Delete old organization members and recreate with role_id
    const acmeOrg = organization;
    const afrisincOrg = afrisinc;

    await prisma.organizationMember.deleteMany({
      where: {
        organization_id: { in: [acmeOrg.id, afrisincOrg.id] },
      },
    });

    // Acme members
    await prisma.organizationMember.createMany({
      data: [
        {
          organization_id: acmeOrg.id,
          user_id: orgOwner.id,
          role_id: roles[0].id, // SUPER_ADMIN
        },
        {
          organization_id: acmeOrg.id,
          user_id: orgAdmin.id,
          role_id: roles[1].id, // OPS_MANAGER
        },
      ],
    });

    // AfrisInc members
    await prisma.organizationMember.createMany({
      data: [
        {
          organization_id: afrisincOrg.id,
          user_id: afrisinc_owner.id,
          role_id: roles[0].id, // SUPER_ADMIN
        },
        {
          organization_id: afrisincOrg.id,
          user_id: afrisinc_admin.id,
          role_id: roles[4].id, // SUPPORT_LEAD
        },
      ],
    });

    logger.info('Updated organization members with role_id');

    logger.info('✅ RBAC system seeding completed!');

    // Seed tokens for security testing
    logger.info('Creating sample tokens...');

    // Create 128 tokens distributed across all users (reduced from 1284 for connection pool)
    const tokenBatchSize = 20;
    let tokenCount = 0;
    for (let batch = 0; batch < 128; batch += tokenBatchSize) {
      const tokenBatch = [];
      for (let i = batch; i < Math.min(batch + tokenBatchSize, 128); i++) {
        const userIndex = i % users.length;
        const tokenType = ['access', 'refresh', 'api_key'][i % 3];
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        tokenBatch.push(
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
      await Promise.all(tokenBatch);
      tokenCount += tokenBatch.length;
    }

    logger.info(`Created ${tokenCount} tokens for security testing`);

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
