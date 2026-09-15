-- DropForeignKey
ALTER TABLE "Gym" DROP CONSTRAINT "Gym_adminId_fkey";

-- AlterTable
ALTER TABLE "Gym" ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
