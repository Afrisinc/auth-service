import { prisma } from '@/database/prismaClient';

export class AnalyticsRepository {
  // Overview: Get summary counts
  async getOverview() {
    const [totalUsers, totalAccounts, totalOrganizations, totalEnrollments] = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.organization.count(),
      prisma.accountProduct.count(),
    ]);

    const enrollmentsByStatus = await prisma.accountProduct.groupBy({
      by: ['status'],
      _count: true,
    });

    const accountsByType = await prisma.account.groupBy({
      by: ['type'],
      _count: true,
    });

    const enrollmentsByProduct = await prisma.accountProduct.groupBy({
      by: ['product_id'],
      _count: true,
      where: {
        status: 'ACTIVE',
      },
    });

    // Get product details for enrollments
    const products = await prisma.product.findMany({
      select: { id: true, code: true },
    });

    const productMap = new Map(products.map(p => [p.id, p.code]));

    return {
      total_users: totalUsers,
      total_accounts: totalAccounts,
      total_organizations: totalOrganizations,
      total_enrollments: totalEnrollments,
      active_enrollments: enrollmentsByStatus.find(e => e.status === 'ACTIVE')?._count || 0,
      suspended_enrollments: enrollmentsByStatus.find(e => e.status === 'SUSPENDED')?._count || 0,
      individual_accounts: accountsByType.find(a => a.type === 'INDIVIDUAL')?._count || 0,
      organization_accounts: accountsByType.find(a => a.type === 'ORGANIZATION')?._count || 0,
      products: enrollmentsByProduct.map(ep => ({
        product_code: productMap.get(ep.product_id),
        total_enrollments: ep._count,
        active_enrollments: ep._count, // Already filtered for ACTIVE
      })),
    };
  }

  // User Analytics: Get user statistics for a date range
  async getUserAnalytics(rangeInDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rangeInDays);

    const [totalUsers, newUsersInRange, suspendedUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: cutoffDate,
          },
        },
      }),
      prisma.user.count({
        where: {
          status: 'suspended',
        },
      }),
    ]);

    // Verified users: users with login events
    const verifiedUsers = await prisma.user.count({
      where: {
        loginEvents: {
          some: {},
        },
      },
    });

    // Active users in range: users with successful login in the range
    const activeUsersInRange = await prisma.loginEvent.count({
      where: {
        status: 'success',
        createdAt: {
          gte: cutoffDate,
        },
      },
    });

    return {
      total_users: totalUsers,
      new_users_in_range: newUsersInRange,
      verified_users: verifiedUsers,
      suspended_users: suspendedUsers,
      active_users_in_range: activeUsersInRange,
    };
  }

  // Account Analytics: Get account statistics
  async getAccountAnalytics() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const [totalAccounts, newAccounts30d] = await Promise.all([
      prisma.account.count(),
      prisma.account.count({
        where: {
          createdAt: {
            gte: cutoffDate,
          },
        },
      }),
    ]);

    const accountsByType = await prisma.account.groupBy({
      by: ['type'],
      _count: true,
    });

    // Active accounts: have at least one active product enrollment
    const activeAccounts30d = (await prisma.$queryRaw`
      SELECT COUNT(DISTINCT a.id) as count
      FROM accounts a
      INNER JOIN account_products ap ON a.id = ap.account_id
      WHERE ap.status = 'ACTIVE'
      AND a.createdAt >= ${cutoffDate}
    `) as [{ count: bigint }];

    return {
      total_accounts: totalAccounts,
      individual_accounts: accountsByType.find(a => a.type === 'INDIVIDUAL')?._count || 0,
      organization_accounts: accountsByType.find(a => a.type === 'ORGANIZATION')?._count || 0,
      new_accounts_30d: newAccounts30d,
      active_accounts_30d: Number(activeAccounts30d[0].count),
    };
  }

  // Product Enrollment Analytics: Get enrollment statistics
  async getProductAnalytics() {
    const enrollmentsByProduct = await prisma.accountProduct.groupBy({
      by: ['product_id', 'status', 'plan'],
      _count: true,
    });

    const products = await prisma.product.findMany({
      select: { id: true, code: true },
    });

    const productMap = new Map(products.map(p => [p.id, p.code]));

    // Group by product
    const productStats = new Map<string, any>();

    enrollmentsByProduct.forEach(stat => {
      const productCode = productMap.get(stat.product_id) || 'unknown';
      if (!productStats.has(productCode)) {
        productStats.set(productCode, {
          product_code: productCode,
          total_enrollments: 0,
          active_enrollments: 0,
          suspended_enrollments: 0,
          plan_distribution: { FREE: 0, PRO: 0, ENTERPRISE: 0 },
        });
      }

      const stats = productStats.get(productCode);
      stats.total_enrollments += stat._count;

      if (stat.status === 'ACTIVE') {
        stats.active_enrollments += stat._count;
      } else if (stat.status === 'SUSPENDED') {
        stats.suspended_enrollments += stat._count;
      }

      if (stat.plan in stats.plan_distribution) {
        stats.plan_distribution[stat.plan] += stat._count;
      }
    });

    return {
      products: Array.from(productStats.values()),
    };
  }

  // Growth Metrics: Get daily aggregation for growth trends
  async getGrowthMetrics(rangeInDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rangeInDays);

    // Users growth
    const userGrowth = await prisma.$queryRaw`
      SELECT
        DATE(CAST("createdAt" as DATE)) as date,
        COUNT(*) as count
      FROM users
      WHERE "createdAt" >= ${cutoffDate}
      GROUP BY DATE(CAST("createdAt" as DATE))
      ORDER BY date ASC
    `;

    // Accounts growth
    const accountGrowth = await prisma.$queryRaw`
      SELECT
        DATE(CAST("createdAt" as DATE)) as date,
        COUNT(*) as count
      FROM accounts
      WHERE "createdAt" >= ${cutoffDate}
      GROUP BY DATE(CAST("createdAt" as DATE))
      ORDER BY date ASC
    `;

    // Enrollments growth
    const enrollmentGrowth = await prisma.$queryRaw`
      SELECT
        DATE(CAST("createdAt" as DATE)) as date,
        COUNT(*) as count
      FROM account_products
      WHERE "createdAt" >= ${cutoffDate}
      GROUP BY DATE(CAST("createdAt" as DATE))
      ORDER BY date ASC
    `;

    return {
      users: (userGrowth as any[]).map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
      accounts: (accountGrowth as any[]).map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
      enrollments: (enrollmentGrowth as any[]).map(row => ({
        date: row.date,
        count: Number(row.count),
      })),
    };
  }
}
