import { net } from 'electron';
import Store from 'electron-store';

import snapshotRaw from '../changelog.json?raw';

const CHANGELOG_URLS = [
  'https://raw.githubusercontent.com/JonathanDevHurtado/ostinato/master/changelog.json',
  'https://cdn.jsdelivr.net/gh/JonathanDevHurtado/ostinato@master/changelog.json',
];

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;

const MAX_ENTRIES = 100;
const MAX_SECTIONS = 20;
const MAX_ITEMS = 100;
const MAX_ENTRY_VERSION = 64;
const MAX_TITLE = 200;
const MAX_INTRO = 20_000;
const MAX_ITEM = 4000;

export interface ChangelogSection {
  title?: string;
  items: string[];
}

export interface ChangelogEntry {
  version: string;
  tag: 'release' | 'beta';
  intro?: string;
  sections: ChangelogSection[];
  footnotes?: string[];
}

export interface ChangelogPayload {
  schemaVersion: number;
  updatedAt?: string;
  entries: ChangelogEntry[];
}

interface CachedChangelog {
  fetchedAt: number;
  etag?: string;
  payload: ChangelogPayload;
}

interface FetchResult {
  payload: ChangelogPayload | null;
  notModified: boolean;
  etag?: string;
}

const cacheStore = new Store<{ cache?: CachedChangelog }>({
  name: 'changelog-cache',
});

const isString = (value: unknown): value is string => typeof value === 'string';

const clamp = (value: string, max: number) =>
  value.length > max ? value.slice(0, max) : value;

const normalizeEntry = (value: unknown): ChangelogEntry | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Record<string, unknown>;
  if (!isString(raw.version)) {
    return null;
  }

  const version = clamp(raw.version.trim(), MAX_ENTRY_VERSION);
  if (!version) {
    return null;
  }

  const sections: ChangelogSection[] = [];
  if (Array.isArray(raw.sections)) {
    for (const sectionValue of raw.sections.slice(0, MAX_SECTIONS)) {
      if (!sectionValue || typeof sectionValue !== 'object') {
        continue;
      }

      const rawSection = sectionValue as Record<string, unknown>;
      if (!Array.isArray(rawSection.items)) {
        continue;
      }

      const items = rawSection.items
        .filter(isString)
        .slice(0, MAX_ITEMS)
        .map((item) => clamp(item, MAX_ITEM));

      if (items.length === 0) {
        continue;
      }

      const section: ChangelogSection = { items };
      if (isString(rawSection.title) && rawSection.title.trim()) {
        section.title = clamp(rawSection.title.trim(), MAX_TITLE);
      }
      sections.push(section);
    }
  }

  if (sections.length === 0) {
    return null;
  }

  const entry: ChangelogEntry = {
    version,
    tag: raw.tag === 'release' ? 'release' : 'beta',
    sections,
  };

  if (isString(raw.intro) && raw.intro.trim()) {
    entry.intro = clamp(raw.intro, MAX_INTRO);
  }

  if (Array.isArray(raw.footnotes)) {
    const footnotes = raw.footnotes
      .filter(isString)
      .slice(0, MAX_ITEMS)
      .map((note) => clamp(note, MAX_ITEM));
    if (footnotes.length > 0) {
      entry.footnotes = footnotes;
    }
  }

  return entry;
};

export const normalizePayload = (value: unknown): ChangelogPayload | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Record<string, unknown>;
  if (typeof raw.schemaVersion !== 'number' || raw.schemaVersion < 1) {
    return null;
  }
  if (!Array.isArray(raw.entries)) {
    return null;
  }

  const entries = raw.entries
    .slice(0, MAX_ENTRIES)
    .map(normalizeEntry)
    .filter((entry): entry is ChangelogEntry => entry !== null);

  if (entries.length === 0) {
    return null;
  }

  const payload: ChangelogPayload = {
    schemaVersion: raw.schemaVersion,
    entries,
  };
  if (isString(raw.updatedAt)) {
    payload.updatedAt = clamp(raw.updatedAt, MAX_ENTRY_VERSION);
  }

  return payload;
};

const SNAPSHOT: ChangelogPayload = (() => {
  try {
    const parsed = normalizePayload(JSON.parse(snapshotRaw));
    if (parsed) {
      return parsed;
    }
    console.error('[changelog] Bundled snapshot has no usable entries');
  } catch (error) {
    console.error('[changelog] Bundled snapshot is not valid JSON', error);
  }

  return { schemaVersion: 1, entries: [] };
})();

const readCache = (): CachedChangelog | null => {
  try {
    const cached = cacheStore.get('cache');
    if (!cached || typeof cached.fetchedAt !== 'number') {
      return null;
    }

    const payload = normalizePayload(cached.payload);
    if (!payload) {
      return null;
    }

    return {
      fetchedAt: cached.fetchedAt,
      etag: isString(cached.etag) ? cached.etag : undefined,
      payload,
    };
  } catch (error) {
    console.error('[changelog] Failed to read cache', error);
    return null;
  }
};

const writeCache = (value: CachedChangelog) => {
  try {
    cacheStore.set('cache', value);
  } catch (error) {
    console.error('[changelog] Failed to write cache', error);
  }
};

const fetchChangelog = async (
  url: string,
  etag?: string,
): Promise<FetchResult | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (etag) {
      headers['if-none-match'] = etag;
    }

    const response = await net.fetch(url, {
      headers,
      signal: controller.signal,
    });

    if (response.status === 304) {
      return { payload: null, notModified: true };
    }

    if (!response.ok) {
      console.warn(`[changelog] ${url} responded with ${response.status}`);
      return null;
    }

    const payload = normalizePayload(await response.json());
    if (!payload) {
      console.warn(`[changelog] ${url} returned an unusable payload`);
      return null;
    }

    return {
      payload,
      notModified: false,
      etag: response.headers.get('etag') ?? undefined,
    };
  } catch (error) {
    console.warn(`[changelog] Request to ${url} failed`, error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

let inFlight: Promise<ChangelogPayload | null> | null = null;

export const getChangelog = (): ChangelogPayload =>
  readCache()?.payload ?? SNAPSHOT;

export const refreshChangelog = (
  force = false,
): Promise<ChangelogPayload | null> => {
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    const cached = readCache();
    if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.payload;
    }

    for (const url of CHANGELOG_URLS) {
      const result = await fetchChangelog(url, cached?.etag);
      if (!result) {
        continue;
      }

      if (result.notModified) {
        if (cached) {
          writeCache({ ...cached, fetchedAt: Date.now() });
          return cached.payload;
        }
        continue;
      }

      if (result.payload) {
        writeCache({
          fetchedAt: Date.now(),
          etag: result.etag,
          payload: result.payload,
        });
        return result.payload;
      }
    }

    return cached?.payload ?? null;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
};

export const serializeForScript = (value: unknown): string =>
  JSON.stringify(value).replace(
    /[<\u2028\u2029]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
