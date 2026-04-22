/*
  Warnings:

  - You are about to drop the `School` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `schoolId` on the `Stock` table. All the data in the column will be lost.
  - Added the required column `unitId` to the `Stock` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "School";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unitId" TEXT NOT NULL,
    "tonerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stock_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stock_tonerId_fkey" FOREIGN KEY ("tonerId") REFERENCES "TonerModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Stock" ("id", "quantity", "tonerId", "updatedAt") SELECT "id", "quantity", "tonerId", "updatedAt" FROM "Stock";
DROP TABLE "Stock";
ALTER TABLE "new_Stock" RENAME TO "Stock";
CREATE UNIQUE INDEX "Stock_unitId_tonerId_key" ON "Stock"("unitId", "tonerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
