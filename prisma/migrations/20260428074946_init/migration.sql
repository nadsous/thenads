-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "coverEmoji" TEXT NOT NULL DEFAULT '✈️',
    "accentFrom" TEXT NOT NULL DEFAULT '#f97316',
    "accentTo" TEXT NOT NULL DEFAULT '#ec4899',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "label" TEXT NOT NULL,
    "subtitle" TEXT,
    "colorFrom" TEXT NOT NULL,
    "colorTo" TEXT NOT NULL,
    "isOff" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    CONSTRAINT "Day_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "dayId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "address" TEXT,
    "description" TEXT NOT NULL,
    "humorComment" TEXT NOT NULL,
    "tip" TEXT,
    "openingHours" TEXT,
    "suggestedStart" TEXT,
    "suggestedEnd" TEXT,
    "durationMinutes" INTEGER,
    "segment" TEXT,
    "orderInDay" INTEGER NOT NULL DEFAULT 0,
    "mustReserve" BOOLEAN NOT NULL DEFAULT false,
    "isRainyAlt" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "emoji" TEXT NOT NULL DEFAULT '📍',
    CONSTRAINT "Place_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Place_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "Day" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_slug_key" ON "Trip"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Day_tripId_index_key" ON "Day"("tripId", "index");
