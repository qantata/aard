/*
  Warnings:

  - You are about to drop the column `filepath` on the `Movie` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "VideoFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "rawProbeData" TEXT NOT NULL,
    "probeData" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    CONSTRAINT "VideoFile_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoStreamProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isHls" BOOLEAN NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "container" TEXT,
    "videoCodec" TEXT NOT NULL,
    "videoBitrate" INTEGER NOT NULL,
    "audioCodec" TEXT,
    "audioBitrate" INTEGER,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "VideoStreamProfile_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "VideoStreamSessionClient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoStreamSessionClient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "isOwner" BOOLEAN NOT NULL,
    "videoStreamSessionId" TEXT NOT NULL,
    CONSTRAINT "VideoStreamSessionClient_videoStreamSessionId_fkey" FOREIGN KEY ("videoStreamSessionId") REFERENCES "VideoStreamSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VideoStreamSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    CONSTRAINT "VideoStreamSession_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "VideoFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "libraryId" TEXT NOT NULL,
    CONSTRAINT "Movie_libraryId_fkey" FOREIGN KEY ("libraryId") REFERENCES "Library" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Movie" ("id", "libraryId", "title", "year") SELECT "id", "libraryId", "title", "year" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
