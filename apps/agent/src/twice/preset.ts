import { mcpServerRecordSchema, type McpServerRecordCandidateMap } from '@/mcp/servers';
import type { ToolSafetyLevel } from '@/tools/types';

export const TWICE_MCP_SERVER_NAME = 'twice';
export const TWICE_MCP_SERVER_URL = 'https://twice.sh/mcp';

// Reads a page through twice's browsers; it spends the owner's twice budget but
// changes nothing, so it runs without the confirmation gate. Every other twice
// tool (verify, survey, explore, regress, publish) stays opt-in from the panel.
export const TWICE_DEFAULT_ENABLED_TOOL_LIST: readonly {
  readonly toolName: string;
  readonly safety: ToolSafetyLevel;
}[] = [{ toolName: 'twice_fetch', safety: 'safe' }];

export function buildTwiceAuthorizationHeaderMap(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` };
}

export function isTwiceMcpServerUrl(candidateUrl: string): boolean {
  try {
    return new URL(candidateUrl).href === new URL(TWICE_MCP_SERVER_URL).href;
  } catch {
    return false;
  }
}

export function findTwiceMcpServerId(
  serverRecordMap: McpServerRecordCandidateMap,
): string | null {
  for (const [serverId, rawRecord] of Object.entries(serverRecordMap)) {
    const parsedRecord = mcpServerRecordSchema.safeParse(rawRecord);
    if (parsedRecord.success && isTwiceMcpServerUrl(parsedRecord.data.server_url)) {
      return serverId;
    }
  }
  return null;
}

// The shape opencode reads from its config file for a remote MCP server.
export function buildTwiceOpencodeMcpEntry(apiKey: string): {
  readonly type: 'remote';
  readonly url: string;
  readonly headers: Record<string, string>;
  readonly enabled: true;
} {
  return {
    type: 'remote',
    url: TWICE_MCP_SERVER_URL,
    headers: buildTwiceAuthorizationHeaderMap(apiKey),
    enabled: true,
  };
}
