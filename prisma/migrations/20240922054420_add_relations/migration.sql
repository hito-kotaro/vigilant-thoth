/*
  Warnings:

  - You are about to drop the column `tenant_id` on the `tx_book_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `tx_book_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `tx_rental_histories` table. All the data in the column will be lost.
  - Added the required column `user_name` to the `tx_book_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tx_book_reviews" DROP COLUMN "tenant_id",
DROP COLUMN "user_id",
ADD COLUMN     "user_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "tx_rental_histories" DROP COLUMN "tenant_id";

-- AddForeignKey
ALTER TABLE "tx_tenant_books" ADD CONSTRAINT "tx_tenant_books_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "mst_tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tx_rental_histories" ADD CONSTRAINT "tx_rental_histories_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "tx_tenant_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tx_book_reviews" ADD CONSTRAINT "tx_book_reviews_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "tx_tenant_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
