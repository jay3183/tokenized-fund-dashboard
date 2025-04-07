-- CreateTable
CREATE TABLE "YieldSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fundId" TEXT NOT NULL,
    "yield" REAL NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'system',
    CONSTRAINT "YieldSnapshot_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
