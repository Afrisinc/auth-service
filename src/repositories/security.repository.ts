import prisma from '@/database/prisma';

export class SecurityRepository {
  async getFailedLoginsCount(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return prisma.loginFailure.count({
      where: {
        createdAt: {
          gte: since,
        },
      },
    });
  }

  async getTokenIssuanceCount() {
    return prisma.token.count();
  }

  async getTopIPs(hours: number = 24, limit: number = 5) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const failures = await prisma.loginFailure.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        ip_address: true,
      },
    });

    // Group by IP and count
    const ipCounts: Record<string, number> = {};
    failures.forEach(f => {
      ipCounts[f.ip_address] = (ipCounts[f.ip_address] || 0) + 1;
    });

    // Convert to array and sort
    const topIPs = Object.entries(ipCounts)
      .map(([ip, attempts]) => ({ ip, attempts }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, limit);

    return topIPs;
  }

  async detectSuspiciousActivity(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Check if any IP has > 20 failed attempts
    const topIPs = await this.getTopIPs(hours, 100);
    if (topIPs.some(entry => entry.attempts > 20)) {
      return true;
    }

    // Check if any email has > 15 failed attempts
    const emailFailures = await prisma.loginFailure.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        email: true,
      },
    });

    const emailCounts: Record<string, number> = {};
    emailFailures.forEach(f => {
      emailCounts[f.email] = (emailCounts[f.email] || 0) + 1;
    });

    if (Object.values(emailCounts).some(count => count > 15)) {
      return true;
    }

    // Check for coordinated attack (multiple IPs, same email)
    const coordinatedAttacks = await prisma.loginFailure.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        email: true,
        ip_address: true,
      },
    });

    const emailToIPs: Record<string, Set<string>> = {};
    coordinatedAttacks.forEach(f => {
      if (!emailToIPs[f.email]) {
        emailToIPs[f.email] = new Set();
      }
      emailToIPs[f.email].add(f.ip_address);
    });

    if (Object.values(emailToIPs).some(ips => ips.size > 2)) {
      return true;
    }

    return false;
  }

  async getRecentFailedLogins(hours: number = 24, limit: number = 10) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return prisma.loginFailure.findMany({
      where: {
        createdAt: {
          gte: since,
        },
      },
      select: {
        id: true,
        email: true,
        ip_address: true,
        failure_reason: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async createLoginFailure(data: {
    email: string;
    ip_address: string;
    failure_reason: string;
    user_id?: string;
    session_id?: string;
  }) {
    return prisma.loginFailure.create({
      data,
    });
  }

  async createToken(data: { user_id: string; token_type: string; expires_at?: Date }) {
    return prisma.token.create({
      data,
    });
  }

  async revokeToken(token_id: string) {
    return prisma.token.update({
      where: { id: token_id },
      data: { revoked_at: new Date() },
    });
  }
}
