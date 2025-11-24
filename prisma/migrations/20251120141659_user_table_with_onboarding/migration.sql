-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('map', 'female', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user');

-- CreateEnum
CREATE TYPE "MainGoal" AS ENUM ('lose_weight', 'find_self_love', 'build_muscle', 'keep_fit');

-- CreateEnum
CREATE TYPE "Activity" AS ENUM ('pilates', 'general_fitness', 'yoga', 'walking', 'stretching');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "role" "Role" NOT NULL,
    "hashedRt" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "mainGoal" "MainGoal",
    "activities" "Activity"[],
    "height" INTEGER,
    "currentWeight" DOUBLE PRECISION,
    "goalWeight" DOUBLE PRECISION,
    "rating" INTEGER,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
