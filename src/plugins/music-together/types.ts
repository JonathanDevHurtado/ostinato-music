export type Profile = {
  id: string;
  handleId: string;
  name: string;
  thumbnail: string;
};
export type VideoData = {
  videoId: string;
  ownerId: string;
};
export type Permission = 'host-only' | 'playlist' | 'all';

const AVATAR_COLORS = [
  '#0F766E',
  '#0E7490',
  '#1D4ED8',
  '#4F46E5',
  '#7C3AED',
  '#BE185D',
  '#B45309',
] as const;

// Local SVG avatar. The previous implementation fetched
// `ui-avatars.com/api/?name=<nickname>`, which leaked the guest's nickname
// (and IP) to a third party just to draw a placeholder. Generating the image
// in the renderer keeps the nickname on the machine.
const localAvatar = (name: string): string => {
  let hash = 0;
  for (const char of name) {
    hash = Math.imul(hash, 31) + (char.codePointAt(0) ?? 0);
    hash >>>= 0;
  }

  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
  const safeInitials = initials.replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      default:
        return '&quot;';
    }
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${color}"/><text x="32" y="33" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="system-ui, sans-serif" font-size="26" font-weight="600">${safeInitials}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const getDefaultProfile = (
  connectionID: string,
  id: string = Date.now().toString(),
): Profile => {
  const name = `Guest ${id.slice(0, 4)}`;

  return {
    id: connectionID,
    handleId: `#music-together:${id}`,
    name,
    thumbnail: localAvatar(name),
  };
};
