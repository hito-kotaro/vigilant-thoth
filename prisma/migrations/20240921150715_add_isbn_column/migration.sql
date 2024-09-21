/*
  Warnings:

  - Added the required column `isbn` to the `tx_tenant_books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tx_tenant_books" ADD COLUMN     "isbn" TEXT NOT NULL;
