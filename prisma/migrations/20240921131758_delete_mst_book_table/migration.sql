/*
  Warnings:

  - You are about to drop the column `notice_string` on the `mst_tenants` table. All the data in the column will be lost.
  - You are about to drop the `mst_books` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "mst_tenants" DROP COLUMN "notice_string";

-- DropTable
DROP TABLE "mst_books";
