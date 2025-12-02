export const LeaderboardPeriod = {
  LAST_30_DAYS: 'last_30_days',
  ALL_TIME: 'all_time',
} as const;

export type LeaderboardPeriodType = typeof LeaderboardPeriod[keyof typeof LeaderboardPeriod];