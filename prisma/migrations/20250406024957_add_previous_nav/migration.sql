-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fund" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "currentNav" REAL NOT NULL,
    "previousNav" REAL NOT NULL DEFAULT 100.0,
    "intradayYield" REAL NOT NULL,
    "totalAum" REAL NOT NULL,
    "inceptionDate" DATETIME
);
INSERT INTO "new_Fund" ("assetType", "chainId", "currentNav", "id", "inceptionDate", "intradayYield", "name", "totalAum") SELECT "assetType", "chainId", "currentNav", "id", "inceptionDate", "intradayYield", "name", "totalAum" FROM "Fund";
DROP TABLE "Fund";
ALTER TABLE "new_Fund" RENAME TO "Fund";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
