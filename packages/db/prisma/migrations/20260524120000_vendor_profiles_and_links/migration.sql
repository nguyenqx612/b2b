-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('pending', 'approved', 'blocked');

-- CreateEnum
CREATE TYPE "LinkSource" AS ENUM ('admin', 'vendor_invite', 'buyer_request');

-- CreateTable
CREATE TABLE "vendor_profiles" (
    "seller_id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "tagline" VARCHAR(300),
    "about" TEXT,
    "website_url" VARCHAR(500),
    "logo_url" VARCHAR(500),
    "teaser_categories" JSONB NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("seller_id")
);

-- CreateTable
CREATE TABLE "buyer_vendor_links" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'pending',
    "source" "LinkSource" NOT NULL,
    "invited_email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "buyer_vendor_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_profiles_slug_key" ON "vendor_profiles"("slug");

-- CreateIndex
CREATE INDEX "idx_vendor_links_seller" ON "buyer_vendor_links"("seller_id", "status");

-- CreateIndex
CREATE INDEX "idx_vendor_links_buyer" ON "buyer_vendor_links"("buyer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_vendor_links_buyer_id_seller_id_key" ON "buyer_vendor_links"("buyer_id", "seller_id");

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_vendor_links" ADD CONSTRAINT "buyer_vendor_links_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_vendor_links" ADD CONSTRAINT "buyer_vendor_links_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
