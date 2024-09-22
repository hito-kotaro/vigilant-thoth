/*
  Warnings:

  - You are about to drop the column `user_id` on the `tx_rental_histories` table. All the data in the column will be lost.
  - Added the required column `user_name` to the `tx_rental_histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tx_rental_histories" DROP COLUMN "user_id",
ADD COLUMN     "user_name" TEXT NOT NULL;
