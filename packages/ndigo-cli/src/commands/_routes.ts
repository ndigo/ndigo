/**
 * Internal single source of truth for the CLI's top-level routes: the
 * completion script and its parity test both read this list, so adding a
 * command without forgetting completion is test-pinned (review REV-011,
 * issue #148).
 */

/** The registered top-level route names, excluding the `db` namespace and the `g` alias. */
export const CLI_ROUTE_NAMES = [
    'serve',
    'dev',
    'new',
    'generate',
    'inspect',
    'routes',
    'mcp',
    'commands',
    'capabilities',
    'doctor',
    'info',
    'build',
    'test',
    'lint',
    'format',
    'typecheck',
    'verify',
    'clean',
    'config',
    'env',
    'openapi',
    'add',
    'update',
    'logs',
    'ai',
    'ui',
    'completion',
] as const;

/** Every tab-completable root token: the routes plus the `db` namespace and the `g` alias. */
export const COMPLETION_WORDS: readonly string[] = [...CLI_ROUTE_NAMES, 'db', 'g'];
