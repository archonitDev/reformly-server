import { Injectable, NotFoundException } from '@nestjs/common';
import { PointSource } from '@prisma/client';
import { LeaderboardPeriod, LeaderboardPeriodType } from './types/leaderboard-period.type';
import { LeaderboardRepository } from './repos/leaderboard.repository';
import { UsersService } from '@app/users/users.service';

const LEVEL_THRESHOLDS: number[] = [
  0,
  5,
  20,
  70,
  150,
  500,
  2000,
  8000,
  30000,
  50000,
];

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly usersService: UsersService,
  ) {}

  async recordPoints(userId: string, delta: number, source: PointSource): Promise<void> {
    await this.leaderboardRepository.recordPoints(userId, delta, source);
  }

  private calculateLevel(points: number): {
    level: number;
    currentLevelMin: number;
    nextLevelMin: number | null;
  } {
    const safePoints = Math.max(0, points);

    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (safePoints >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }

    const currentLevelMin = LEVEL_THRESHOLDS[level - 1];
    const nextLevelMin =
      level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : null;

    return { level, currentLevelMin, nextLevelMin };
  }

  private buildLevelsOverview(points: number) {
    const safePoints = Math.max(0, points);

    return LEVEL_THRESHOLDS.map((minPoints, index) => ({
      level: index + 1,
      minPoints,
      unlocked: safePoints >= minPoints,
    }));
  }

  async getUserOverview(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalPoints = user?.totalPoints ?? 0;

    const { level, currentLevelMin, nextLevelMin } =
      this.calculateLevel(totalPoints);

    const levels = this.buildLevelsOverview(totalPoints);

    return {
      user,
      totalPoints,
      level,
      currentLevelMin,
      nextLevelMin,
      pointsToNextLevel:
        nextLevelMin !== null ? Math.max(0, nextLevelMin - totalPoints) : null,
      levels,
    };
  }

  async getLeaderboard(
    period: LeaderboardPeriodType,
    limit: number = 50,
  ): Promise<{
    period: LeaderboardPeriodType;
    users: Array<{
      rank: number;
      userId: string;
      name: string;
      lastName: string;
      profilePictureUrl: string | null;
      level: number;
      totalPoints: number;
      periodPoints: number;
    }>;
  }> {
    const resolvedPeriod = period ?? LeaderboardPeriod.LAST_30_DAYS;

    let fromDate: Date | null = null;
    if (resolvedPeriod === LeaderboardPeriod.LAST_30_DAYS) {
      const now = new Date();
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const grouped = await this.leaderboardRepository.groupUserPoints(fromDate, limit);

    if (!grouped.length) {
      return {
        period: resolvedPeriod,
        users: [],
      };
    }

    const userIds = grouped.map((g) => g.userId);

    const users = await this.leaderboardRepository.findUsersForLeaderboard(userIds);

    const usersMap = new Map(users.map((u) => [u.id, u]));

    const ranked = grouped
      .map((g, index) => {
        const user = usersMap.get(g.userId);
        if (!user) {
          return null;
        }

        const totalPoints = user.totalPoints ?? 0;
        const { level } = this.calculateLevel(totalPoints);

        return {
          rank: index + 1,
          userId: user.id,
          name: user.name,
          lastName: user.lastName,
          profilePictureUrl: user.profilePictureUrl,
          level,
          totalPoints,
          periodPoints: g._sum.delta ?? 0,
        };
      })
      .filter(Boolean) as Array<{
      rank: number;
      userId: string;
      name: string;
      lastName: string;
      profilePictureUrl: string | null;
      level: number;
      totalPoints: number;
      periodPoints: number;
    }>;

    return {
      period: resolvedPeriod,
      users: ranked,
    };
  }
}