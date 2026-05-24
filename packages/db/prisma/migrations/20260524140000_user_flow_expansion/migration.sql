-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'shipper';

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('draft', 'submitted', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "vendor_profiles" ADD COLUMN "catalog_source_url" VARCHAR(500),
ADD COLUMN "catalog_last_imported_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "buyer_vendor_links" ADD COLUMN "rejection_note" VARCHAR(500);

-- CreateTable
CREATE TABLE "vendor_conversations" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "body" TEXT,
    "file_s3_key" TEXT,
    "file_name" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipper_profiles" (
    "user_id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(200) NOT NULL,
    "tagline" VARCHAR(300),
    "about" TEXT,
    "logo_url" VARCHAR(500),
    "service_regions" JSONB NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipper_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "freight_quotes" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "shipper_id" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'submitted',
    "freight_cents" INTEGER NOT NULL,
    "transit_days" INTEGER,
    "notes" TEXT,
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "freight_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendor_conversations_buyer_id_seller_id_key" ON "vendor_conversations"("buyer_id", "seller_id");

-- CreateIndex
CREATE INDEX "idx_vendor_messages_conv" ON "vendor_messages"("conversation_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "shipper_profiles_slug_key" ON "shipper_profiles"("slug");

-- CreateIndex
CREATE INDEX "idx_freight_quotes_po" ON "freight_quotes"("po_id");

-- CreateIndex
CREATE INDEX "idx_freight_quotes_shipper" ON "freight_quotes"("shipper_id");

-- AddForeignKey
ALTER TABLE "vendor_conversations" ADD CONSTRAINT "vendor_conversations_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_conversations" ADD CONSTRAINT "vendor_conversations_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_messages" ADD CONSTRAINT "vendor_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "vendor_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_messages" ADD CONSTRAINT "vendor_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipper_profiles" ADD CONSTRAINT "shipper_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freight_quotes" ADD CONSTRAINT "freight_quotes_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freight_quotes" ADD CONSTRAINT "freight_quotes_shipper_id_fkey" FOREIGN KEY ("shipper_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
