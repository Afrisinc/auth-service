-- AlterTable
ALTER TABLE "products" ADD COLUMN     "allowedCallbacks" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "baseUrl" TEXT NOT NULL DEFAULT '';
