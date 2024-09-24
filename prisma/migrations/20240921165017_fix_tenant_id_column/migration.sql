/*
  Warnings:

  - Changed the type of `tenant_id` on the `mst_users` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "mst_users" DROP COLUMN "tenant_id",
ADD COLUMN     "tenant_id" INTEGER NOT NULL;
