-- CreateTable
CREATE TABLE "mst_tenants" (
    "id" SERIAL NOT NULL,
    "tenant_name" TEXT NOT NULL,
    "root_user" TEXT NOT NULL,
    "root_password" TEXT NOT NULL,
    "notice_string" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "mst_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mst_tenants_tenant_name_key" ON "mst_tenants"("tenant_name");
