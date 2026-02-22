-- AlterTable
ALTER TABLE "products" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "login_failures" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "failure_reason" TEXT NOT NULL,
    "user_id" TEXT,
    "session_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_failures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_type" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_failures_createdAt_idx" ON "login_failures"("createdAt");

-- CreateIndex
CREATE INDEX "login_failures_ip_address_idx" ON "login_failures"("ip_address");

-- CreateIndex
CREATE INDEX "login_failures_email_idx" ON "login_failures"("email");

-- CreateIndex
CREATE INDEX "login_failures_user_id_idx" ON "login_failures"("user_id");

-- CreateIndex
CREATE INDEX "login_failures_ip_address_createdAt_idx" ON "login_failures"("ip_address", "createdAt");

-- CreateIndex
CREATE INDEX "login_failures_email_createdAt_idx" ON "login_failures"("email", "createdAt");

-- CreateIndex
CREATE INDEX "tokens_user_id_idx" ON "tokens"("user_id");

-- CreateIndex
CREATE INDEX "tokens_issued_at_idx" ON "tokens"("issued_at");

-- CreateIndex
CREATE INDEX "tokens_user_id_issued_at_idx" ON "tokens"("user_id", "issued_at");

-- AddForeignKey
ALTER TABLE "login_failures" ADD CONSTRAINT "login_failures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
