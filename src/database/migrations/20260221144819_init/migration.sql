-- DropForeignKey
ALTER TABLE "login_events" DROP CONSTRAINT "login_events_user_id_fkey";

-- DropIndex
DROP INDEX "account_products_created_at_idx";

-- DropIndex
DROP INDEX "account_products_status_idx";

-- DropIndex
DROP INDEX "accounts_created_at_idx";

-- DropIndex
DROP INDEX "users_created_at_idx";

-- AddForeignKey
ALTER TABLE "login_events" ADD CONSTRAINT "login_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "login_events_created_at_idx" RENAME TO "login_events_createdAt_idx";
