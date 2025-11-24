import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { WorkoutProgram, Prisma, WorkoutCategory } from '@prisma/client';

@Injectable()
export class WorkoutProgramsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WorkoutProgramWhereInput;
    orderBy?: Prisma.WorkoutProgramOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.workoutProgram.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        _count: {
          select: {
            workouts: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.workoutProgram.findUnique({
      where: { id },
      include: {
        workouts: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            workouts: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.WorkoutProgramWhereInput): Promise<number> {
    return this.prisma.workoutProgram.count({ where });
  }
}

