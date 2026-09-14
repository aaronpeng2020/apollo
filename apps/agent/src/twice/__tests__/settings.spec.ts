import { describe, expect, it } from 'bun:test';

import type { MemorySqlExecutor, MemorySqlRow } from '@/memory/store';
import {
  buildTwiceOpencodeMcpEntry,
  findTwiceMcpServerId,
  TWICE_MCP_SERVER_URL,
} from '@/twice/preset';
import {
  buildTwiceStatus,
  deleteTwiceApiKey,
  maskTwiceApiKey,
  readTwiceApiKey,
  saveTwiceApiKey,
  setTwiceApiKeyInputSchema,
  TWICE_API_KEY_PREFERENCE_KEY,
  twiceApiKeySchema,
} from '@/twice/settings';
import { TWICE_USAGE_URL, verifyTwiceApiKey } from '@/twice/verify';

const SAMPLE_KEY = `tw_${'a1b2c3d4'.repeat(4)}`;
const LEGACY_KEY = `vd_${'z9y8x7w6'.repeat(4)}`;

function createInMemoryPreferenceSqlExecutor(): MemorySqlExecutor & {
  readonly preferenceMap: Map<string, string>;
} {
  const preferenceMap = new Map<string, string>();
  function executeFakeQuery(
    query: string,
    ...bindValues: unknown[]
  ): readonly MemorySqlRow[] {
    if (query.startsWith('SELECT value FROM session_prefs')) {
      const storedValue = preferenceMap.get(String(bindValues[0]));
      return storedValue === undefined ? [] : [{ value: storedValue }];
    }
    if (query.startsWith('INSERT INTO session_prefs')) {
      preferenceMap.set(String(bindValues[0]), String(bindValues[1]));
      return [];
    }
    if (query.startsWith('DELETE FROM session_prefs')) {
      preferenceMap.delete(String(bindValues[0]));
      return [];
    }
    throw new Error(`Unexpected query: ${query}`);
  }
  return {
    preferenceMap,
    execute<Row extends MemorySqlRow>(query: string, ...bindValues: unknown[]) {
      return executeFakeQuery(query, ...bindValues) as readonly Row[];
    },
  };
}

describe('twiceApiKeySchema', () => {
  it('accepts a current key and a legacy vd_ key', () => {
    expect(twiceApiKeySchema.safeParse(SAMPLE_KEY).success).toBe(true);
    expect(twiceApiKeySchema.safeParse(LEGACY_KEY).success).toBe(true);
    expect(twiceApiKeySchema.parse(`  ${SAMPLE_KEY}  `)).toBe(SAMPLE_KEY);
  });

  it('rejects other shapes', () => {
    for (const candidate of [
      '',
      'tw_short',
      `sk_${'a1b2c3d4'.repeat(4)}`,
      `tw_${'A1B2C3D4'.repeat(4)}`,
      `${SAMPLE_KEY}x`,
    ]) {
      expect(twiceApiKeySchema.safeParse(candidate).success).toBe(false);
    }
  });

  it('requires the dashboard secret next to the key', () => {
    expect(setTwiceApiKeyInputSchema.safeParse({ apiKey: SAMPLE_KEY }).success).toBe(
      false,
    );
    expect(
      setTwiceApiKeyInputSchema.safeParse({ secret: 'dashboard', apiKey: SAMPLE_KEY })
        .success,
    ).toBe(true);
  });
});

describe('twice status', () => {
  it('exposes only a short prefix of the key', () => {
    expect(maskTwiceApiKey(SAMPLE_KEY)).toBe('tw_a1b2…');
    expect(buildTwiceStatus(SAMPLE_KEY)).toEqual({
      isConfigured: true,
      keyPrefix: 'tw_a1b2…',
    });
    expect(buildTwiceStatus(null)).toEqual({ isConfigured: false, keyPrefix: null });
  });
});

describe('twice key storage', () => {
  it('round-trips through session preferences and clears', async () => {
    const sqlExecutor = createInMemoryPreferenceSqlExecutor();
    expect(await readTwiceApiKey(sqlExecutor)).toBeNull();
    await saveTwiceApiKey(sqlExecutor, SAMPLE_KEY);
    expect(sqlExecutor.preferenceMap.get(TWICE_API_KEY_PREFERENCE_KEY)).toBe(SAMPLE_KEY);
    expect(await readTwiceApiKey(sqlExecutor)).toBe(SAMPLE_KEY);
    await deleteTwiceApiKey(sqlExecutor);
    expect(await readTwiceApiKey(sqlExecutor)).toBeNull();
  });

  it('treats a stored value that no longer parses as absent', async () => {
    const sqlExecutor = createInMemoryPreferenceSqlExecutor();
    sqlExecutor.preferenceMap.set(TWICE_API_KEY_PREFERENCE_KEY, 'corrupt');
    expect(await readTwiceApiKey(sqlExecutor)).toBeNull();
  });

  it('refuses to store a malformed key', async () => {
    const sqlExecutor = createInMemoryPreferenceSqlExecutor();
    await expect(saveTwiceApiKey(sqlExecutor, 'tw_nope')).rejects.toThrow();
    expect(sqlExecutor.preferenceMap.size).toBe(0);
  });
});

describe('twice preset', () => {
  it('finds the installed twice server by url regardless of id', () => {
    expect(
      findTwiceMcpServerId({
        abc: {
          name: 'github',
          server_url: 'https://api.githubcopilot.com/mcp/',
          state: 'ready',
        },
        xyz: { name: 'twice', server_url: `${TWICE_MCP_SERVER_URL}`, state: 'ready' },
        bad: null,
      }),
    ).toBe('xyz');
    expect(findTwiceMcpServerId({ bad: null })).toBeNull();
  });

  it('builds the opencode remote entry with the bearer header', () => {
    expect(buildTwiceOpencodeMcpEntry(SAMPLE_KEY)).toEqual({
      type: 'remote',
      url: 'https://twice.sh/mcp',
      headers: { Authorization: `Bearer ${SAMPLE_KEY}` },
      enabled: true,
    });
  });
});

function createFakeTwiceFetch(
  fetchHandler: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
): typeof fetch {
  return Object.assign(fetchHandler, { preconnect: () => {} });
}

describe('verifyTwiceApiKey', () => {
  it('calls the usage endpoint with the key and reads the status', async () => {
    const requestList: { url: string; authorization: string | null }[] = [];
    const fetchImplementation = createFakeTwiceFetch(async (input, init) => {
      const headers = new Headers(init?.headers);
      requestList.push({
        url: String(input),
        authorization: headers.get('Authorization'),
      });
      return new Response('{}', { status: 200 });
    });
    expect(await verifyTwiceApiKey({ apiKey: SAMPLE_KEY, fetchImplementation })).toEqual({
      outcome: 'valid',
    });
    expect(requestList).toEqual([
      { url: TWICE_USAGE_URL, authorization: `Bearer ${SAMPLE_KEY}` },
    ]);
  });

  it('reports a rejected key and an unreachable service separately', async () => {
    expect(
      await verifyTwiceApiKey({
        apiKey: SAMPLE_KEY,
        fetchImplementation: createFakeTwiceFetch(
          async () => new Response('nope', { status: 401 }),
        ),
      }),
    ).toEqual({ outcome: 'rejected', status: 401 });
    expect(
      await verifyTwiceApiKey({
        apiKey: SAMPLE_KEY,
        fetchImplementation: createFakeTwiceFetch(async () => {
          throw new Error('dns');
        }),
      }),
    ).toEqual({ outcome: 'unreachable', reason: 'dns' });
  });
});
