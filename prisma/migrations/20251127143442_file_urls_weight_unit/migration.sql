/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('kg', 'lb');

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "imageUrl",
ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePictureUrl" TEXT,
ADD COLUMN     "weightUnit" "WeightUnit" DEFAULT 'kg';
