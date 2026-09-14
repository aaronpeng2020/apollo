import { TWICE_DASHBOARD_URL } from '@/twice/settings';

export const TWICE_USAGE_URL = 'https://twice.sh/v1/usage';

const TWICE_VERIFY_TIMEOUT_MILLISECONDS = 8000;

export type TwiceApiKeyVerification =
  | { readonly outcome: 'valid' }
  | { readonly outcome: 'rejected'; readonly status: number }
  | { readonly outcome: 'unreachable'; readonly reason: string };

export async function verifyTwiceApiKey(input: {
  readonly apiKey: string;
  readonly fetchImplementation?: typeof fetch;
}): Promise<TwiceApiKeyVerification> {
  const fetchImplementation = input.fetchImplementation ?? fetch;
  try {
    const response = await fetchImplementation(TWICE_USAGE_URL, {
      method: 'GET',
      headers: { Authorization: `Bearer ${input.apiKey}` },
      signal: AbortSignal.timeout(TWICE_VERIFY_TIMEOUT_MILLISECONDS),
    });
    return response.ok
      ? { outcome: 'valid' }
      : { outcome: 'rejected', status: response.status };
  } catch (error) {
    return {
      outcome: 'unreachable',
      reason: error instanceof Error ? error.message : String(error),
    };
  }
}

export function describeTwiceApiKeyVerificationFailure(
  verification: Exclude<TwiceApiKeyVerification, { outcome: 'valid' }>,
): string {
  return verification.outcome === 'rejected'
    ? `twice.sh rejected the key (HTTP ${verification.status}) — copy it again from ${TWICE_DASHBOARD_URL}`
    : `Could not reach twice.sh to check the key: ${verification.reason}`;
}
