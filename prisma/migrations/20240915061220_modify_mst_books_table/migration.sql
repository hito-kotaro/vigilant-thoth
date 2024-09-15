/*
  Warnings:

  - Added the required column `author` to the `mst_books` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mst_books" ADD COLUMN     "author" TEXT NOT NULL;
