import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { WorkoutCompletion, Prisma } from '@prisma/client';

@Injectable()
export class WorkoutCompletionsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.WorkoutCompletionCreateInput): Promise<WorkoutCompletion> {
    return this.prisma.workoutCompletion.create({ data });
  }

  async upsert(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutCompletion> {
    return this.prisma.workoutCompletion.upsert({
      where: {
        workoutId_userId: {
          workoutId,
          userId,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        workout: {
          connect: { id: workoutId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findById(id: string): Promise<WorkoutCompletion | null> {
    return this.prisma.workoutCompletion.findUnique({ where: { id } });
  }

  async findByWorkoutAndUser(workoutId: string, userId: string): Promise<WorkoutCompletion | null> {
    return this.prisma.workoutCompletion.findUnique({
      where: {
        workoutId_userId: {
          workoutId,
          userId,
        },
      },
    });
  }

  async findByUser(userId: string, params?: { skip?: number; take?: number }) {
    return this.prisma.workoutCompletion.findMany({
      where: { userId },
      skip: params?.skip,
      take: params?.take,
      orderBy: { completedAt: 'desc' },
      include: {
        workout: {
          include: {
            program: true,
          },
        },
      },
    });
  }

  async countByWorkout(workoutId: string): Promise<number> {
    return this.prisma.workoutCompletion.count({ where: { workoutId } });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.workoutCompletion.count({ where: { userId } });
  }

  async countAmountByProgramId(programId: string, userId: string): Promise<number> {
    return this.prisma.workoutCompletion.count({
      where: {
        workout: {
          programId,
        },
        userId,
      },
    });
  }

  async findMostRecentProgramIds(
    userId: string,
    skip: number,
    take: number,
  ): Promise<string[]> {
    const result = await this.prisma.$queryRaw<{ programId: string }[]>`
      SELECT w."programId"
      FROM "WorkoutCompletion" wc
      JOIN "Workout" w ON wc."workoutId" = w.id
      WHERE wc."userId" = ${userId}::uuid
      GROUP BY w."programId"
      ORDER BY MAX(wc."completedAt") DESC
      LIMIT ${take} OFFSET ${skip}
    `;
    return result.map((r) => r.programId);
  }
}

