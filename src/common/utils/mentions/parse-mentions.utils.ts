const MENTION_REGEX = /@([a-zA-Z0-9_]+)/g;

export type MentionsParseResult = {
  usernames: string[];
  everyone: boolean;
};

/**
 * Parses text content and returns:
 * - unique usernames mentioned via @username
 * - whether @everyone was used at least once
 */
export function parseMentions(content: string, excludeUsernames?: string[]): MentionsParseResult {
  const usernamesSet = new Set<string>();
  let everyone = false;
  let match: RegExpExecArray | null;

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    const tag = match[1];
    if (!tag) continue;

    if (tag.toLowerCase() === 'everyone') {
      everyone = true;
    } else {
      if (!excludeUsernames || !excludeUsernames.includes(tag)) {
        usernamesSet.add(tag);
      }
    }
  }

  return {
    usernames: Array.from(usernamesSet),
    everyone,
  };
}

/**
 * Convenience helper for cases where only direct @username
 * mentions are relevant (e.g., comments).
 */
export function parseUserMentions(content: string): string[] {
  const { usernames } = parseMentions(content);
  return usernames;
}


