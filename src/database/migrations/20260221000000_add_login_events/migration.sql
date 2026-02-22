-- Create login_events table for tracking user login activity
CREATE TABLE "login_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "login_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE
);

-- Create indexes for analytics queries
CREATE INDEX "login_events_user_id_idx" ON "login_events"("user_id");
CREATE INDEX "login_events_created_at_idx" ON "login_events"("createdAt");
CREATE INDEX "login_events_status_idx" ON "login_events"("status");

-- Add indexes for existing tables (if not already present)
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("createdAt");
CREATE INDEX IF NOT EXISTS "accounts_created_at_idx" ON "accounts"("createdAt");
CREATE INDEX IF NOT EXISTS "account_products_created_at_idx" ON "account_products"("createdAt");
CREATE INDEX IF NOT EXISTS "account_products_status_idx" ON "account_products"("status");
CREATE INDEX IF NOT EXISTS "account_products_product_id_idx" ON "account_products"("product_id");
