-- AddForeignKey
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "mst_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
