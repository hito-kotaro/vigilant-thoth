/*
  Warnings:

  - Added the required column `tenant_id` to the `tx_book_reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `tx_rental_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tx_book_reviews" ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "tx_rental_histories" ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "tx_rental_histories" ADD CONSTRAINT "tx_rental_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "mst_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tx_book_reviews" ADD CONSTRAINT "tx_book_reviews_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "mst_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
