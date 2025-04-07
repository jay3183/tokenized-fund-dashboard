-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Portfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investorId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "shares" REAL NOT NULL,
    "lastYieldWithdrawal" DATETIME,
    "accruedYield" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Portfolio_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Portfolio" ("fundId", "id", "investorId", "shares") SELECT "fundId", "id", "investorId", "shares" FROM "Portfolio";
DROP TABLE "Portfolio";
ALTER TABLE "new_Portfolio" RENAME TO "Portfolio";
CREATE UNIQUE INDEX "Portfolio_investorId_fundId_key" ON "Portfolio"("investorId", "fundId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
