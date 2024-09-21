/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `tx_tenant_books` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tx_tenant_books_isbn_key" ON "tx_tenant_books"("isbn");
