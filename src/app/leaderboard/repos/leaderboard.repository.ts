import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/prisma/prisma.service';
import { PointSource, Prisma } from '@prisma/client';

@Injectable()
export class LeaderboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async recordPoints(userId: string, delta: number, source: PointSource): Promise<void> {
    if (!delta) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userPoint.create({
        data: {
          userId,
          delta,
          source,
        },
      });

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: delta,
          },
        },
        select: {
          id: true,
          totalPoints: true,
        },
      });

      if (user.totalPoints < 0) {
        await tx.user.update({
          where: { id: userId },
          data: { totalPoints: 0 },
        });
      }
    });
  }

  async groupUserPoints(fromDate: Date | null, limit: number) {
    const where: Prisma.UserPointWhereInput = {};

    if (fromDate) {
      where.createdAt = {
        gte: fromDate,
      };
    }

    const result = await this.prisma.userPoint.groupBy({
      by: ['userId'],
      where,
      _sum: {
        delta: true,
      },
      orderBy: {
        _sum: {
          delta: 'desc',
        },
      },
      take: limit,
    });

    return result;
  }

  async findUsersForLeaderboard(userIds: string[]) {
    return this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        profilePictureUrl: true,
        totalPoints: true,
      },
    });
  }
}


