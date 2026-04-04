-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductStatus" ADD VALUE 'DEPRECATED';
ALTER TYPE "ProductStatus" ADD VALUE 'COMING_SOON';
ALTER TYPE "ProductStatus" ADD VALUE 'BETA';
ALTER TYPE "ProductStatus" ADD VALUE 'LIVE';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'PROVISIONING';
