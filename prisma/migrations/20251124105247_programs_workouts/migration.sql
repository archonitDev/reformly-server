-- CreateEnum
CREATE TYPE "WorkoutCategory" AS ENUM ('all', 'pilates', 'yoga', 'meditation', 'hiit', 'stretching', 'cardio');

-- CreateTable
CREATE TABLE "WorkoutProgram" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "WorkoutCategory" NOT NULL,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutCompletion" (
    "id" UUID NOT NULL,
    "workoutId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "watchedDuration" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLike" (
    "id" UUID NOT NULL,
    "workoutId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "purchaseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutEquipment" (
    "id" UUID NOT NULL,
    "workoutId" UUID NOT NULL,
    "equipmentId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutProgram_category_idx" ON "WorkoutProgram"("category");

-- CreateIndex
CREATE INDEX "WorkoutProgram_createdAt_idx" ON "WorkoutProgram"("createdAt");

-- CreateIndex
CREATE INDEX "Workout_programId_idx" ON "Workout"("programId");

-- CreateIndex
CREATE INDEX "Workout_createdAt_idx" ON "Workout"("createdAt");

-- CreateIndex
CREATE INDEX "WorkoutCompletion_workoutId_idx" ON "WorkoutCompletion"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutCompletion_userId_idx" ON "WorkoutCompletion"("userId");

-- CreateIndex
CREATE INDEX "WorkoutCompletion_completedAt_idx" ON "WorkoutCompletion"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutCompletion_workoutId_userId_key" ON "WorkoutCompletion"("workoutId", "userId");

-- CreateIndex
CREATE INDEX "WorkoutLike_workoutId_idx" ON "WorkoutLike"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutLike_userId_idx" ON "WorkoutLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutLike_workoutId_userId_key" ON "WorkoutLike"("workoutId", "userId");

-- CreateIndex
CREATE INDEX "Equipment_name_idx" ON "Equipment"("name");

-- CreateIndex
CREATE INDEX "WorkoutEquipment_workoutId_idx" ON "WorkoutEquipment"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutEquipment_equipmentId_idx" ON "WorkoutEquipment"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutEquipment_workoutId_equipmentId_key" ON "WorkoutEquipment"("workoutId", "equipmentId");

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_programId_fkey" FOREIGN KEY ("programId") REFERENCES "WorkoutProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutCompletion" ADD CONSTRAINT "WorkoutCompletion_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutCompletion" ADD CONSTRAINT "WorkoutCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLike" ADD CONSTRAINT "WorkoutLike_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLike" ADD CONSTRAINT "WorkoutLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEquipment" ADD CONSTRAINT "WorkoutEquipment_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutEquipment" ADD CONSTRAINT "WorkoutEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
