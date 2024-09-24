-- DropForeignKey
ALTER TABLE "mst_users" DROP CONSTRAINT "mst_users_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "tx_book_reviews" DROP CONSTRAINT "tx_book_reviews_book_id_fkey";

-- DropForeignKey
ALTER TABLE "tx_rental_histories" DROP CONSTRAINT "tx_rental_histories_book_id_fkey";

-- DropForeignKey
ALTER TABLE "tx_tenant_books" DROP CONSTRAINT "tx_tenant_books_tenant_id_fkey";

-- AddForeignKey
ALTER TABLE "mst_users" ADD CONSTRAINT "mst_users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "mst_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tx_tenant_books" ADD CONSTRAINT "tx_tenant_books_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "mst_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tx_rental_histories" ADD CONSTRAINT "tx_rental_histories_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "tx_tenant_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tx_book_reviews" ADD CONSTRAINT "tx_book_reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "tx_tenant_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
