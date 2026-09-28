/*
  Warnings:

  - A unique constraint covering the columns `[transactionNumber]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionNumber` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transactionNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionNumber_key" ON "Transaction"("transactionNumber");
