/**
 * seed-platform.ts
 *
 * Seeds everything needed to test the full Afrisinc Control login flow:
 *
 *  1. CONTROL product  — with baseUrl + allowedCallbacks pointing at the platform frontend
 *  2. admin@afrisinc.com — the ADMIN_EMAIL user (bypasses product lookup entirely)
 *  3. Platform team users — one per role, matching the TEAM_MEMBERS seed in platform-frontend
 *  4. Accounts + org membership — so the auth-service can resolve role_id on /oauth/exchange
 *  5. Account → CONTROL product enrollment — so login redirects to /auth/callback
 *
 * Run:
 *   npm run db:seed-platform
 *
 * Credentials:
 *   All users: Password123!
 *
 * Must be run AFTER the base seed (npm run db:seed) so roles already exist.
 */

import { logger } from '@/utils/logger.js';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

// ── Config ────────────────────────────────────────────────────────────────────

const PASSWORD = 'Password123!';

/**
 * Local dev URLs — update these to match your running services.
 * PLATFORM_CALLBACK must match ADMIN_CALLBACK_URL in auth-service .env
 * and the VITE_API_URL / origin of platform-frontend.
 */
const PLATFORM_BASE_URL = 'http://localhost:8080';
const PLATFORM_CALLBACK = 'http://localhost:8080/auth/callback';

// ── Team users (mirrors platform-frontend TEAM_MEMBERS) ───────────────────────

const TEAM_USERS = [
  { firstName: 'Admin', lastName: 'Afrisinc', email: 'admin@afrisinc.com', roleName: 'SUPER_ADMIN' },
  { firstName: 'Kofi', lastName: 'Mensah', email: 'kofi@afrisinc.com', roleName: 'SUPER_ADMIN' },
  { firstName: 'Ama', lastName: 'Owusu', email: 'ama@afrisinc.com', roleName: 'OPS_MANAGER' },
  { firstName: 'James', lastName: 'Quaye', email: 'james@afrisinc.com', roleName: 'PRODUCT_MANAGER' },
  { firstName: 'Abena', lastName: 'Boateng', email: 'abena@afrisinc.com', roleName: 'SUPPORT_LEAD' },
  { firstName: 'Fatou', lastName: 'Diallo', email: 'fatou@afrisinc.com', roleName: 'SUPPORT_AGENT' },
  { firstName: 'Kwame', lastName: 'Asante', email: 'kwame@afrisinc.com', roleName: 'TECHNICAL_AGENT' },
  { firstName: 'Nadia', lastName: 'Osei', email: 'nadia@afrisinc.com', roleName: 'ANALYST' },
  { firstName: 'Yaw', lastName: 'Darko', email: 'yaw@afrisinc.com', roleName: 'FINANCE_ADMIN' },
] as const;

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  try {
    logger.info('Starting platform seed...');

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // ── 1. CONTROL product ───────────────────────────────────────────────────
    logger.info('Upserting CONTROL product...');
    const controlProduct = await prisma.product.upsert({
      where: { code: 'CONTROL' },
      update: {
        name: 'Afrisinc Control',
        description: 'Internal platform management dashboard for the Afrisinc team.',
        baseUrl: PLATFORM_BASE_URL,
        allowedCallbacks: [PLATFORM_CALLBACK],
        status: 'ACTIVE',
      },
      create: {
        name: 'Afrisinc Control',
        code: 'CONTROL',
        description: 'Internal platform management dashboard for the Afrisinc team.',
        baseUrl: PLATFORM_BASE_URL,
        allowedCallbacks: [PLATFORM_CALLBACK],
        status: 'ACTIVE',
      },
    });
    logger.info(`CONTROL product ready — callback: ${PLATFORM_CALLBACK}`);

    // ── 2. Roles lookup (must already exist from base seed) ──────────────────
    const roles = await prisma.role.findMany();
    const roleMap = Object.fromEntries(roles.map(r => [r.name, r]));

    const missingRoles = TEAM_USERS.map(u => u.roleName).filter(name => !roleMap[name]);

    if (missingRoles.length > 0) {
      throw new Error(
        `Missing roles in DB: ${missingRoles.join(', ')}.\n` + 'Run the base seed first:  npm run db:seed'
      );
    }

    // ── 3. Afrisinc org (must already exist from base seed) ──────────────────
    let afrisincOrg = await prisma.organization.findFirst({
      where: { name: 'AfrisInc' },
    });

    if (!afrisincOrg) {
      logger.info('AfrisInc org not found — creating it now...');
      afrisincOrg = await prisma.organization.create({
        data: {
          name: 'AfrisInc',
          legal_name: 'African Solutions and Innovation Company Limited',
          country: 'NG',
          org_email: 'info@afrisinc.com',
          org_phone: '+234-1-6292050',
          location: 'Victoria Island, Lagos, Nigeria',
        },
      });
    }

    logger.info(`Using org: ${afrisincOrg.name} (${afrisincOrg.id})`);

    // ── 4. Upsert each team user, account, org membership, and enrollment ────
    logger.info(`Seeding ${TEAM_USERS.length} platform team users...`);

    for (const member of TEAM_USERS) {
      // 4a. User
      const user = await prisma.user.upsert({
        where: { email: member.email },
        update: {
          firstName: member.firstName,
          lastName: member.lastName,
          status: 'ACTIVE',
        },
        create: {
          email: member.email,
          password_hash: hashedPassword,
          firstName: member.firstName,
          lastName: member.lastName,
          status: 'ACTIVE',
        },
      });

      // 4b. Individual account (one per user)
      const account = await prisma.account.upsert({
        where: { id: `${user.id}-individual` },
        update: {},
        create: {
          id: `${user.id}-individual`,
          type: 'INDIVIDUAL',
          owner_user_id: user.id,
        },
      });

      // 4c. Org membership with role_id (so /oauth/exchange returns role + role_id)
      const role = roleMap[member.roleName];
      await prisma.organizationMember.upsert({
        where: {
          organization_id_user_id: {
            organization_id: afrisincOrg!.id,
            user_id: user.id,
          },
        },
        update: { role_id: role.id },
        create: {
          organization_id: afrisincOrg!.id,
          user_id: user.id,
          role_id: role.id,
        },
      });

      // 4d. Enroll in CONTROL product (so login redirects to platform callback)
      await prisma.accountProduct.upsert({
        where: {
          account_id_product_id: {
            account_id: account.id,
            product_id: controlProduct.id,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          account_id: account.id,
          product_id: controlProduct.id,
          status: 'ACTIVE',
          plan: 'FREE',
        },
      });

      logger.info(`  ✓ ${member.firstName} ${member.lastName} <${member.email}> → ${member.roleName}`);
    }

    // ── 5. Summary ───────────────────────────────────────────────────────────
    logger.info('');
    logger.info('Platform seed complete!');
    logger.info('');
    logger.info('════════════════════════════════════════════════');
    logger.info('  CONTROL PRODUCT');
    logger.info(`  Callback URL : ${PLATFORM_CALLBACK}`);
    logger.info('════════════════════════════════════════════════');
    logger.info('  LOGIN CREDENTIALS  (all use: Password123!)');
    logger.info('────────────────────────────────────────────────');
    for (const m of TEAM_USERS) {
      logger.info(`  ${m.email.padEnd(32)} ${m.roleName}`);
    }
    logger.info('════════════════════════════════════════════════');
    logger.info('');
    logger.info('Login flow:');
    logger.info(`  1. Open auth-ui       →  http://localhost:8098/login`);
    logger.info(`  2. Sign in with any email above`);
    logger.info(`  3. Redirected to      →  ${PLATFORM_CALLBACK}?code=<code>`);
    logger.info(`  4. Platform (8080) exchanges code via gateway (8091)`);
    logger.info(`  5. Dashboard loads with role-specific sidebar menu`);
  } catch (err: any) {
    logger.error('Platform seed failed: ' + (err?.message ?? err));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
