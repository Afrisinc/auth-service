-- CreateTable
CREATE TABLE "member_product_access" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "role_id" TEXT,
    "granted_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_product_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "member_product_access_organization_id_idx" ON "member_product_access"("organization_id");

-- CreateIndex
CREATE INDEX "member_product_access_user_id_idx" ON "member_product_access"("user_id");

-- CreateIndex
CREATE INDEX "member_product_access_product_id_idx" ON "member_product_access"("product_id");

-- CreateIndex
CREATE INDEX "member_product_access_role_id_idx" ON "member_product_access"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_product_access_organization_id_user_id_product_id_key" ON "member_product_access"("organization_id", "user_id", "product_id");

-- AddForeignKey
ALTER TABLE "member_product_access" ADD CONSTRAINT "member_product_access_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_product_access" ADD CONSTRAINT "member_product_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_product_access" ADD CONSTRAINT "member_product_access_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_product_access" ADD CONSTRAINT "member_product_access_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_product_access" ADD CONSTRAINT "member_product_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
