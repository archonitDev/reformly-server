import { PrismaService } from '@libs/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Workout, Prisma } from '@prisma/client';

@Injectable()
export class WorkoutsRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.workout.findUnique({
      where: { id },
      include: {
        equipment: {
          include: {
            equipment: true,
          },
        },
      },
    });
  }

  async findByProgramId(programId: string) {
    return this.prisma.workout.findMany({
      where: { programId },
      orderBy: { createdAt: 'asc' },
      include: {
        equipment: {
          include: {
            equipment: true,
          },
        },
      },
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WorkoutWhereInput;
    orderBy?: Prisma.WorkoutOrderByWithRelationInput;
  }) {
    const { skip, take, where, orderBy } = params;
    return this.prisma.workout.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        equipment: {
          include: {
            equipment: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.WorkoutWhereInput): Promise<number> {
    return this.prisma.workout.count({ where });
  }
}





