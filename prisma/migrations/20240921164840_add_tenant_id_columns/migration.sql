/*
  Warnings:

  - Added the required column `tenant_id` to the `mst_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mst_users" ADD COLUMN     "tenant_id" TEXT NOT NULL;
