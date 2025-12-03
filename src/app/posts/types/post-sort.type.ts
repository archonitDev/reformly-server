export const PostSort = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
} as const;

export type PostSortType = typeof PostSort[keyof typeof PostSort];