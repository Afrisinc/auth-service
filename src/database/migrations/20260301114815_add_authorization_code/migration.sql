-- CreateTable
CREATE TABLE "authorization_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_code" TEXT,
    "redirect_uri" TEXT,
    "scope" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "authorization_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "authorization_codes_code_key" ON "authorization_codes"("code");

-- CreateIndex
CREATE INDEX "authorization_codes_code_idx" ON "authorization_codes"("code");

-- CreateIndex
CREATE INDEX "authorization_codes_user_id_idx" ON "authorization_codes"("user_id");

-- CreateIndex
CREATE INDEX "authorization_codes_expires_at_idx" ON "authorization_codes"("expires_at");

-- CreateIndex
CREATE INDEX "authorization_codes_used_at_idx" ON "authorization_codes"("used_at");

-- AddForeignKey
ALTER TABLE "authorization_codes" ADD CONSTRAINT "authorization_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
