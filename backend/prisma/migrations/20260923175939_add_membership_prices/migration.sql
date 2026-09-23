-- CreateTable
CREATE TABLE "MembershipPrice" (
    "id" SERIAL NOT NULL,
    "gymId" INTEGER NOT NULL,
    "dayPass" DECIMAL(10,2) NOT NULL,
    "trial" DECIMAL(10,2) NOT NULL,
    "oneMonth" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPrice_gymId_key" ON "MembershipPrice"("gymId");

-- AddForeignKey
ALTER TABLE "MembershipPrice" ADD CONSTRAINT "MembershipPrice_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE CASCADE ON UPDATE CASCADE;
