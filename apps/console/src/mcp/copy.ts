import type { Locale } from '@/locale/detect';

interface McpMessages {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly refreshLabel: string;
  readonly installServerLabel: string;
  readonly listServersFallbackError: string;
  readonly installRetryFallbackError: string;
  readonly noServersMessage: string;
  readonly toolsOnLabel: (enabledCount: number, totalCount: number) => string;
  readonly needsAuthorizationSuffix: string;
  readonly installDialogTitle: string;
  readonly connectorsPanelTitle: string;
  readonly connectorsPanelMeta: string;
  readonly signInHintLabel: string;
  readonly tokenHintLabel: string;
  readonly installedLabel: string;
  readonly addingLabel: string;
  readonly installLabel: string;
  readonly serverStateLabelMap: Readonly<Record<string, string>>;
  readonly awaitingAuthorizationPrefix: string;
  readonly authorizationLinkLabel: string;
  readonly awaitingAuthorizationSuffix: string;
  readonly toolsEnabledLabel: (enabledCount: number, totalCount: number) => string;
  readonly noToolsMessage: string;
  readonly toggleToolAriaLabel: (isEnabled: boolean, toolName: string) => string;
  readonly safeBadgeLabel: string;
  readonly asksFirstBadgeLabel: string;
  readonly retryingLabel: string;
  readonly retryLabel: string;
  readonly uninstallingLabel: string;
  readonly uninstallLabel: string;
  readonly nameFieldLabel: string;
  readonly urlFieldLabel: string;
  readonly tokenFieldLabel: string;
  readonly installValidationError: string;
  readonly installUrlFallbackError: string;
  readonly tokenFieldHint: string;
  readonly authorizationNoticePrefix: string;
  readonly authorizationNoticeSuffix: string;
  readonly installingLabel: string;
  readonly twicePanelTitle: string;
  readonly twiceConfiguredLabel: string;
  readonly twiceNotConfiguredLabel: string;
  readonly twiceDescription: string;
  readonly twiceKeyFieldLabel: string;
  readonly twiceGetKeyPrefix: string;
  readonly twiceGetKeyLinkLabel: string;
  readonly twiceSaveLabel: string;
  readonly twiceSavingLabel: string;
  readonly twiceClearLabel: string;
  readonly twiceClearingLabel: string;
  readonly twiceKeyFormatError: string;
  readonly twiceStatusFallbackError: string;
  readonly twiceSaveFallbackError: string;
}

export const MCP_MESSAGE_CATALOG: Record<Locale, McpMessages> = {
  es: {
    pageTitle: 'MCP',
    pageDescription: 'Servidores y herramientas que el agente puede usar',
    refreshLabel: 'Actualizar',
    installServerLabel: 'Instalar servidor',
    listServersFallbackError: 'No se pudieron listar los servidores MCP.',
    installRetryFallbackError: 'Falló la instalación — intenta de nuevo.',
    noServersMessage: 'No hay servidores MCP instalados',
    toolsOnLabel: (enabledCount, totalCount) =>
      `${enabledCount}/${totalCount} herramientas activas`,
    needsAuthorizationSuffix: ' · requiere autorización',
    installDialogTitle: 'Instalar un servidor',
    connectorsPanelTitle: 'Conectores',
    connectorsPanelMeta: 'Instalación en un clic',
    signInHintLabel: 'Iniciar sesión',
    tokenHintLabel: 'Token',
    installedLabel: 'Instalado',
    addingLabel: 'Agregando…',
    installLabel: 'Instalar',
    serverStateLabelMap: {
      ready: 'listo',
      connecting: 'conectando',
      authenticating: 'autenticando',
      discovering: 'descubriendo',
      failed: 'falló',
    },
    awaitingAuthorizationPrefix: 'Esperando autorización — ',
    authorizationLinkLabel: 'abre la página de autorización',
    awaitingAuthorizationSuffix: ', luego actualiza.',
    toolsEnabledLabel: (enabledCount, totalCount) =>
      `${enabledCount}/${totalCount} herramientas habilitadas`,
    noToolsMessage: 'Aún no se descubrieron herramientas',
    toggleToolAriaLabel: (isEnabled, toolName) =>
      `${isEnabled ? 'Deshabilitar' : 'Habilitar'} ${toolName}`,
    safeBadgeLabel: 'Segura',
    asksFirstBadgeLabel: 'Pregunta primero',
    retryingLabel: 'Conectando…',
    retryLabel: 'Reintentar conexión',
    uninstallingLabel: 'Quitando…',
    uninstallLabel: 'Desinstalar servidor',
    nameFieldLabel: 'Nombre',
    urlFieldLabel: 'URL del servidor',
    tokenFieldLabel: 'Token de acceso',
    installValidationError: 'Ponle un nombre al servidor y una URL https://.',
    installUrlFallbackError: 'Falló la instalación — revisa la URL.',
    tokenFieldHint:
      'Opcional — solo para servidores que usan un token de acceso personal en lugar de OAuth. Los servidores con inicio de sesión (Linear, Notion) muestran un enlace de autorización tras la instalación.',
    authorizationNoticePrefix: 'Este servidor necesita autorización — ',
    authorizationNoticeSuffix: ', luego actualiza la lista.',
    installingLabel: 'Instalando…',
    twicePanelTitle: 'twice',
    twiceConfiguredLabel: 'clave',
    twiceNotConfiguredLabel: 'sin clave',
    twiceDescription:
      'Con tu propia clave, el agente lee cualquier página web (twice_fetch: pasa desafíos de Cloudflare, lee PDFs) y las tareas de código pueden verificar páginas en navegadores reales.',
    twiceKeyFieldLabel: 'Clave de API de twice',
    twiceGetKeyPrefix: 'Consigue una clave en ',
    twiceGetKeyLinkLabel: 'twice.sh/dashboard',
    twiceSaveLabel: 'Guardar',
    twiceSavingLabel: 'Verificando…',
    twiceClearLabel: 'Quitar clave',
    twiceClearingLabel: 'Quitando…',
    twiceKeyFormatError: 'Una clave de twice empieza con tw_ y tiene 32 caracteres más.',
    twiceStatusFallbackError: 'No se pudo leer el estado de twice.',
    twiceSaveFallbackError: 'No se pudo guardar la clave — intenta de nuevo.',
  },
  en: {
    pageTitle: 'MCP',
    pageDescription: 'Servers and tools the agent may use',
    refreshLabel: 'Refresh',
    installServerLabel: 'Install server',
    listServersFallbackError: 'Could not list MCP servers.',
    installRetryFallbackError: 'Install failed — try again.',
    noServersMessage: 'No MCP servers installed',
    toolsOnLabel: (enabledCount, totalCount) => `${enabledCount}/${totalCount} tools on`,
    needsAuthorizationSuffix: ' · needs authorization',
    installDialogTitle: 'Install a server',
    connectorsPanelTitle: 'Connectors',
    connectorsPanelMeta: 'One-click installs',
    signInHintLabel: 'Sign in',
    tokenHintLabel: 'Token',
    installedLabel: 'Installed',
    addingLabel: 'Adding…',
    installLabel: 'Install',
    serverStateLabelMap: {
      ready: 'ready',
      connecting: 'connecting',
      authenticating: 'authenticating',
      discovering: 'discovering',
      failed: 'failed',
    },
    awaitingAuthorizationPrefix: 'Awaiting authorization — ',
    authorizationLinkLabel: 'open the auth page',
    awaitingAuthorizationSuffix: ', then refresh.',
    toolsEnabledLabel: (enabledCount, totalCount) =>
      `${enabledCount}/${totalCount} tools enabled`,
    noToolsMessage: 'No tools discovered yet',
    toggleToolAriaLabel: (isEnabled, toolName) =>
      `${isEnabled ? 'Disable' : 'Enable'} ${toolName}`,
    safeBadgeLabel: 'Safe',
    asksFirstBadgeLabel: 'Asks first',
    retryingLabel: 'Connecting…',
    retryLabel: 'Retry connection',
    uninstallingLabel: 'Removing…',
    uninstallLabel: 'Uninstall server',
    nameFieldLabel: 'Name',
    urlFieldLabel: 'Server URL',
    tokenFieldLabel: 'Access token',
    installValidationError: 'Give the server a name and an https:// URL.',
    installUrlFallbackError: 'Install failed — check the URL.',
    tokenFieldHint:
      'Optional — only for servers that use a personal access token instead of OAuth. Sign-in servers (Linear, Notion) show an authorization link after install.',
    authorizationNoticePrefix: 'This server needs authorization — ',
    authorizationNoticeSuffix: ', then refresh the list.',
    installingLabel: 'Installing…',
    twicePanelTitle: 'twice',
    twiceConfiguredLabel: 'key',
    twiceNotConfiguredLabel: 'no key',
    twiceDescription:
      'With your own key the agent can read any web page (twice_fetch: passes Cloudflare challenges, reads PDFs) and coding tasks can verify pages in real browsers.',
    twiceKeyFieldLabel: 'twice API key',
    twiceGetKeyPrefix: 'Get a key at ',
    twiceGetKeyLinkLabel: 'twice.sh/dashboard',
    twiceSaveLabel: 'Save',
    twiceSavingLabel: 'Verifying…',
    twiceClearLabel: 'Remove key',
    twiceClearingLabel: 'Removing…',
    twiceKeyFormatError: 'A twice key starts with tw_ followed by 32 characters.',
    twiceStatusFallbackError: 'Could not read the twice status.',
    twiceSaveFallbackError: 'Could not save the key — try again.',
  },
};

export function resolveServerStateLabel(
  serverState: string,
  mcpMessages: McpMessages,
): string {
  return mcpMessages.serverStateLabelMap[serverState] ?? serverState;
}
