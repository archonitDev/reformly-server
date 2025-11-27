import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { WorkoutLike } from '@prisma/client';

@Injectable()
export class WorkoutLikesRepository {
  constructor(private prisma: PrismaService) {}

  async create(workoutId: string, userId: string): Promise<WorkoutLike> {
    return this.prisma.workoutLike.create({
      data: {
        workout: {
          connect: { id: workoutId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async findByWorkoutAndUser(workoutId: string, userId: string): Promise<WorkoutLike | null> {
    return this.prisma.workoutLike.findUnique({
      where: {
        workoutId_userId: {
          workoutId,
          userId,
        },
      },
    });
  }

  async delete(workoutId: string, userId: string): Promise<WorkoutLike> {
    return this.prisma.workoutLike.delete({
      where: {
        workoutId_userId: {
          workoutId,
          userId,
        },
      },
    });
  }

  async findByUser(userId: string, params?: { skip?: number; take?: number }) {
    return this.prisma.workoutLike.findMany({
      where: { userId },
      skip: params?.skip,
      take: params?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        workout: {
          include: {
            program: true,
            equipment: {
              include: {
                equipment: true,
              },
            },
          },
        },
      },
    });
  }

  async count(workoutId: string): Promise<number> {
    return this.prisma.workoutLike.count({ where: { workoutId } });
  }
}






