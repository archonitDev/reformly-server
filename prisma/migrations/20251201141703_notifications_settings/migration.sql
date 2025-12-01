-- AlterTable
ALTER TABLE "User" ADD COLUMN     "commentsNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exerciseRemindersNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "likesNotifications" BOOLEAN NOT NULL DEFAULT false;
