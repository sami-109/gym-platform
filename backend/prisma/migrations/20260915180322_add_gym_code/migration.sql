/*
  Warnings:

  - A unique constraint covering the columns `[gymCode]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gymCode` to the `Gym` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "gymCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Gym_gymCode_key" ON "Gym"("gymCode");
