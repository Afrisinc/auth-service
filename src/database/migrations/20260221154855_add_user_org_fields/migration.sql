-- Add user profile fields to users table
ALTER TABLE "users" ADD COLUMN "firstName" TEXT;
ALTER TABLE "users" ADD COLUMN "lastName" TEXT;
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "location" TEXT;

-- Add organization contact fields to organizations table
ALTER TABLE "organizations" ADD COLUMN "org_email" TEXT;
ALTER TABLE "organizations" ADD COLUMN "org_phone" TEXT;
ALTER TABLE "organizations" ADD COLUMN "location" TEXT;
