import { prisma } from '../database/prismaClient';

export class AuthorizationCodeRepository {
  async create(data: {
    code: string;
    user_id: string;
    product_code?: string;
    redirect_uri?: string;
    scope?: string;
    expires_at: Date;
  }) {
    return prisma.authorizationCode.create({
      data,
    });
  }

  async findByCode(code: string) {
    return prisma.authorizationCode.findUnique({
      where: { code },
      include: {
        user: true,
      },
    });
  }

  async markAsUsed(codeId: string) {
    return prisma.authorizationCode.update({
      where: { id: codeId },
      data: { used_at: new Date() },
    });
  }

  async deleteExpiredCodes() {
    return prisma.authorizationCode.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  }
}
