/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `mst_tenants` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `mst_users` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `tx_book_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `tx_rental_histories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tx_rental_histories` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `tx_tenant_books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mst_tenants" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "mst_users" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "tx_book_reviews" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "tx_rental_histories" DROP COLUMN "deleted_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "tx_tenant_books" DROP COLUMN "deleted_at";
