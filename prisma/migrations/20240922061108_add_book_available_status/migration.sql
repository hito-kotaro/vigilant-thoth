/*
  Warnings:

  - Added the required column `available` to the `tx_tenant_books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tx_tenant_books" ADD COLUMN     "available" BOOLEAN NOT NULL;
