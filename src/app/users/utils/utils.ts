interface ParsedName {
  firstName: string;
  lastName: string;
}

export const parseFullName = (
    fullName: string | undefined,
    email: string,
  ): ParsedName => {
    if (!fullName || fullName.trim() === '') {
      return {
        firstName: email.split('@')[0],
        lastName: '',
      };
    }

    const nameParts = fullName.trim().split(/\s+/);

    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
    };
  }