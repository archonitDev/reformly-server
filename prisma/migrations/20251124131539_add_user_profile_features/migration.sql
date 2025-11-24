/*
  Warnings:

  - You are about to drop the column `watchedDuration` on the `WorkoutCompletion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leaderboardLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "notificationPreferences" JSONB,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "reminderPreferences" JSONB;

-- AlterTable
ALTER TABLE "WorkoutCompletion" DROP COLUMN "watchedDuration";
