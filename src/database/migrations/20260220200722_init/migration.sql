-- AlterEnum: Add PROVISIONING value to ProductStatus enum
ALTER TYPE "ProductStatus" ADD VALUE 'PROVISIONING' BEFORE 'ACTIVE';
