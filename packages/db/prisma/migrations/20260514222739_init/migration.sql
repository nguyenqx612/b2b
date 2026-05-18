-- CreateEnum
CREATE TYPE "Role" AS ENUM ('buyer', 'seller', 'admin');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('draft', 'submitted', 'acknowledged', 'confirmed', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'file', 'system');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('commercial_invoice', 'packing_list', 'co_form_b', 'phytosanitary', 'bill_of_lading', 'proforma_invoice', 'us_import_declaration');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "company_name" VARCHAR(200),
    "company_address" VARCHAR(500),
    "tax_id" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "price_usd_cents" INTEGER NOT NULL,
    "price_range_min" INTEGER NOT NULL,
    "price_range_max" INTEGER NOT NULL,
    "cbm_per_unit" DECIMAL(10,4) NOT NULL,
    "weight_kg" DECIMAL(10,3),
    "hs_code" VARCHAR(20),
    "origin_country" VARCHAR(2) NOT NULL DEFAULT 'VN',
    "images" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "po_number" VARCHAR(50) NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'draft',
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "shipping_terms" VARCHAR(50),
    "port_of_loading" VARCHAR(200),
    "port_of_discharge" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_versions" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "version_number" INTEGER NOT NULL,
    "changed_by" TEXT NOT NULL,
    "change_reason" VARCHAR(500),
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_items" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "cbm_subtotal" DECIMAL(10,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "po_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proforma_invoices" (
    "id" TEXT NOT NULL,
    "pi_number" VARCHAR(50) NOT NULL,
    "po_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "subtotal_cents" INTEGER NOT NULL,
    "shipping_cents" INTEGER NOT NULL DEFAULT 0,
    "tax_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "payment_terms" VARCHAR(200),
    "validity_days" INTEGER NOT NULL DEFAULT 30,
    "pdf_s3_key" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proforma_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_loads" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "calculated_by" TEXT NOT NULL,
    "total_cbm" DECIMAL(10,4) NOT NULL,
    "container_type" VARCHAR(20) NOT NULL DEFAULT '40ft',
    "container_cbm" DECIMAL(10,4) NOT NULL DEFAULT 67.3,
    "containers_needed" DECIMAL(6,4) NOT NULL,
    "utilization_pct" DECIMAL(5,2) NOT NULL,
    "items_snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "container_loads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_documents" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "doc_type" "DocType" NOT NULL,
    "pdf_s3_key" TEXT,
    "generated_by" TEXT NOT NULL,
    "document_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "export_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'text',
    "body" TEXT,
    "file_s3_key" TEXT,
    "file_name" VARCHAR(255),
    "file_size_bytes" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_breakdowns" (
    "id" TEXT NOT NULL,
    "po_id" TEXT NOT NULL,
    "goods_fob_cents" INTEGER NOT NULL,
    "freight_cents" INTEGER NOT NULL DEFAULT 0,
    "insurance_cents" INTEGER NOT NULL DEFAULT 0,
    "customs_duty_cents" INTEGER NOT NULL DEFAULT 0,
    "port_handling_cents" INTEGER NOT NULL DEFAULT 0,
    "other_cents" INTEGER NOT NULL DEFAULT 0,
    "total_landed_cents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cost_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "metadata" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_products_seller" ON "products"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_seller_id_sku_key" ON "products"("seller_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_po_number_key" ON "purchase_orders"("po_number");

-- CreateIndex
CREATE INDEX "idx_po_buyer" ON "purchase_orders"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_po_seller" ON "purchase_orders"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "po_versions_po_id_version_number_key" ON "po_versions"("po_id", "version_number");

-- CreateIndex
CREATE INDEX "idx_po_items_po" ON "po_items"("po_id");

-- CreateIndex
CREATE UNIQUE INDEX "proforma_invoices_pi_number_key" ON "proforma_invoices"("pi_number");

-- CreateIndex
CREATE INDEX "idx_pi_buyer" ON "proforma_invoices"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_messages_po" ON "messages"("po_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_entity" ON "audit_logs"("entity_type", "entity_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_versions" ADD CONSTRAINT "po_versions_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_versions" ADD CONSTRAINT "po_versions_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_items" ADD CONSTRAINT "po_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proforma_invoices" ADD CONSTRAINT "proforma_invoices_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proforma_invoices" ADD CONSTRAINT "proforma_invoices_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proforma_invoices" ADD CONSTRAINT "proforma_invoices_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_loads" ADD CONSTRAINT "container_loads_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "container_loads" ADD CONSTRAINT "container_loads_calculated_by_fkey" FOREIGN KEY ("calculated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_documents" ADD CONSTRAINT "export_documents_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_documents" ADD CONSTRAINT "export_documents_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_breakdowns" ADD CONSTRAINT "cost_breakdowns_po_id_fkey" FOREIGN KEY ("po_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_breakdowns" ADD CONSTRAINT "cost_breakdowns_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
