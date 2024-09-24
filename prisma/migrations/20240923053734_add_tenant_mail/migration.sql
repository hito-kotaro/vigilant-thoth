/*
  Warnings:

  - Added the required column `root_mail` to the `mst_tenants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mst_tenants" ADD COLUMN     "root_mail" TEXT NOT NULL;
