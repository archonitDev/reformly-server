/*
  Warnings:

  - You are about to drop the column `leaderboardLevel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `notificationPreferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `reminderPreferences` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "HeightUnit" AS ENUM ('cm', 'in');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "leaderboardLevel",
DROP COLUMN "notificationPreferences",
DROP COLUMN "profilePicture",
DROP COLUMN "reminderPreferences",
ADD COLUMN     "heightUnit" "HeightUnit" DEFAULT 'cm';
