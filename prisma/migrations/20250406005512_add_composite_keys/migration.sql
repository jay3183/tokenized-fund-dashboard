/*
  Warnings:

  - A unique constraint covering the columns `[userId,fundId]` on the table `Holding` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[investorId,fundId]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Holding_userId_fundId_key" ON "Holding"("userId", "fundId");

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_investorId_fundId_key" ON "Portfolio"("investorId", "fundId");
