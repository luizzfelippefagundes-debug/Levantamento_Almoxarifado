-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PrinterModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TonerModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "tonerId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stock_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Stock_tonerId_fkey" FOREIGN KEY ("tonerId") REFERENCES "TonerModel" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_TonerToPrinter" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TonerToPrinter_A_fkey" FOREIGN KEY ("A") REFERENCES "PrinterModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TonerToPrinter_B_fkey" FOREIGN KEY ("B") REFERENCES "TonerModel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PrinterModel_name_key" ON "PrinterModel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TonerModel_name_key" ON "TonerModel"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_schoolId_tonerId_key" ON "Stock"("schoolId", "tonerId");

-- CreateIndex
CREATE UNIQUE INDEX "_TonerToPrinter_AB_unique" ON "_TonerToPrinter"("A", "B");

-- CreateIndex
CREATE INDEX "_TonerToPrinter_B_index" ON "_TonerToPrinter"("B");
