export const PostSort = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  RECENTLY_COMMENTED: 'recently_commented',
} as const;

export type PostSortType = typeof PostSort[keyof typeof PostSort];