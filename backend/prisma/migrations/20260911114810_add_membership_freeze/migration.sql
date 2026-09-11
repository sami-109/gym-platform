-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "freezeStartDate" TIMESTAMP(3),
ADD COLUMN     "frozenRemainingSeconds" INTEGER;
