import { z } from 'zod';

import {
  deleteSessionPreference,
  getSessionPreference,
  setSessionPreference,
  type MemorySqlExecutor,
} from '@/memory/store';

export const TWICE_API_KEY_PREFERENCE_KEY = 'twiceApiKey';
export const TWICE_DASHBOARD_URL = 'https://twice.sh/dashboard';

const TWICE_API_KEY_PATTERN = /^(tw|vd)_[a-z0-9]{32}$/;
const TWICE_API_KEY_PREFIX_VISIBLE_LENGTH = 7;

// `vd_` is the prefix twice minted before its rename; the service still honours it.
export const twiceApiKeySchema = z
  .string()
  .trim()
  .regex(
    TWICE_API_KEY_PATTERN,
    'A twice API key looks like tw_ followed by 32 characters',
  );

export const setTwiceApiKeyInputSchema = z.object({
  secret: z.string().min(1),
  apiKey: twiceApiKeySchema,
});

export type SetTwiceApiKeyInput = z.infer<typeof setTwiceApiKeyInputSchema>;

export const twiceSecretInputSchema = z.object({
  secret: z.string().min(1),
});

export type TwiceSecretInput = z.infer<typeof twiceSecretInputSchema>;

export type TwiceStatus = {
  readonly isConfigured: boolean;
  readonly keyPrefix: string | null;
};

// The full key never leaves the Durable Object; the console only ever sees
// enough of it to tell two keys apart.
export function maskTwiceApiKey(apiKey: string): string {
  return `${apiKey.slice(0, TWICE_API_KEY_PREFIX_VISIBLE_LENGTH)}…`;
}

export function buildTwiceStatus(apiKey: string | null): TwiceStatus {
  return apiKey === null
    ? { isConfigured: false, keyPrefix: null }
    : { isConfigured: true, keyPrefix: maskTwiceApiKey(apiKey) };
}

// A stored value that no longer matches the schema is treated as absent rather
// than injected anywhere: the owner re-pastes, nothing runs on a corrupt key.
export async function readTwiceApiKey(
  sqlExecutor: MemorySqlExecutor,
): Promise<string | null> {
  const storedValue = await getSessionPreference(
    sqlExecutor,
    TWICE_API_KEY_PREFERENCE_KEY,
  );
  if (storedValue === null) {
    return null;
  }
  const parsedKey = twiceApiKeySchema.safeParse(storedValue);
  return parsedKey.success ? parsedKey.data : null;
}

export async function saveTwiceApiKey(
  sqlExecutor: MemorySqlExecutor,
  apiKey: string,
): Promise<void> {
  await setSessionPreference(
    sqlExecutor,
    TWICE_API_KEY_PREFERENCE_KEY,
    twiceApiKeySchema.parse(apiKey),
  );
}

export async function deleteTwiceApiKey(sqlExecutor: MemorySqlExecutor): Promise<void> {
  await deleteSessionPreference(sqlExecutor, TWICE_API_KEY_PREFERENCE_KEY);
}
