import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Chip } from '@/blueprint/chip';
import { Panel } from '@/blueprint/panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useMessages } from '@/locale/context';
import { MCP_MESSAGE_CATALOG } from '@/mcp/copy';
import type { ConsoleRpc } from '@/agent/rpc';
import type { TwiceStatus } from '@/agent/schema';

const TWICE_DASHBOARD_URL = 'https://twice.sh/dashboard';
const TWICE_API_KEY_PATTERN = /^(tw|vd)_[a-z0-9]{32}$/;

export function isTwiceApiKeyWellFormed(candidateKey: string): boolean {
  return TWICE_API_KEY_PATTERN.test(candidateKey.trim());
}

export function TwicePanel({
  consoleRpc,
  onChanged,
}: {
  readonly consoleRpc: ConsoleRpc;
  readonly onChanged: () => Promise<void>;
}) {
  const mcpMessages = useMessages(MCP_MESSAGE_CATALOG);
  const [twiceStatus, setTwiceStatus] = useState<TwiceStatus | null>(null);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    void consoleRpc
      .getTwiceStatus()
      .then(setTwiceStatus)
      .catch(() => setErrorMessage(mcpMessages.twiceStatusFallbackError));
  }, [consoleRpc, mcpMessages.twiceStatusFallbackError]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    if (!isTwiceApiKeyWellFormed(apiKeyDraft)) {
      setErrorMessage(mcpMessages.twiceKeyFormatError);
      return;
    }
    setIsSaving(true);
    try {
      setTwiceStatus(await consoleRpc.setTwiceApiKey(apiKeyDraft.trim()));
      setApiKeyDraft('');
      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : mcpMessages.twiceSaveFallbackError,
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClear() {
    setErrorMessage(null);
    setIsClearing(true);
    try {
      setTwiceStatus(await consoleRpc.clearTwiceApiKey());
      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : mcpMessages.twiceSaveFallbackError,
      );
    } finally {
      setIsClearing(false);
    }
  }

  const isBusy = isSaving || isClearing;

  return (
    <Panel
      title={mcpMessages.twicePanelTitle}
      meta={
        twiceStatus === null ? (
          <Skeleton className="h-5 w-16" />
        ) : twiceStatus.isConfigured ? (
          <Chip tone="live">
            {`${mcpMessages.twiceConfiguredLabel} ${twiceStatus.keyPrefix ?? ''}`}
          </Chip>
        ) : (
          <Chip tone="down">{mcpMessages.twiceNotConfiguredLabel}</Chip>
        )
      }
    >
      <div className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">{mcpMessages.twiceDescription}</p>
        <form onSubmit={handleSave} className="space-y-2" aria-busy={isBusy}>
          <Label htmlFor="twice-api-key">{mcpMessages.twiceKeyFieldLabel}</Label>
          <div className="flex gap-2">
            <Input
              id="twice-api-key"
              type="password"
              placeholder="tw_…"
              value={apiKeyDraft}
              onChange={(event) => setApiKeyDraft(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <Button type="submit" variant="outline" disabled={isBusy}>
              {isSaving ? mcpMessages.twiceSavingLabel : mcpMessages.twiceSaveLabel}
            </Button>
            {twiceStatus?.isConfigured === true && (
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => void handleClear()}
              >
                {isClearing
                  ? mcpMessages.twiceClearingLabel
                  : mcpMessages.twiceClearLabel}
              </Button>
            )}
          </div>
          <p className="text-xs text-dim">
            {mcpMessages.twiceGetKeyPrefix}
            <a
              href={TWICE_DASHBOARD_URL}
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              {mcpMessages.twiceGetKeyLinkLabel}
            </a>
          </p>
        </form>
        {errorMessage !== null && (
          <p role="alert" className="text-xs text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    </Panel>
  );
}
