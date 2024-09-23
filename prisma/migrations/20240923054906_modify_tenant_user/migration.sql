/*
  Warnings:

  - You are about to drop the column `root_mail` on the `mst_tenants` table. All the data in the column will be lost.
  - You are about to drop the column `root_password` on the `mst_tenants` table. All the data in the column will be lost.
  - You are about to drop the column `root_user` on the `mst_tenants` table. All the data in the column will be lost.
  - Added the required column `admin` to the `mst_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mst_tenants" DROP COLUMN "root_mail",
DROP COLUMN "root_password",
DROP COLUMN "root_user";

-- AlterTable
ALTER TABLE "mst_users" ADD COLUMN     "admin" BOOLEAN NOT NULL;
