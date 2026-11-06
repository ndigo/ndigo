/**
 * Internal single source of truth for the CLI's top-level routes: the
 * completion script and its parity test both read this list, so adding a
 * command without forgetting completion is test-pinned (review REV-011,
 * issue #148).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/** The registered top-level route names, excluding the `db` namespace and the two aliases. */
export const CLI_ROUTE_NAMES = [
    'serve',
    'dev',
    'new',
    'generate',
    'inspect',
    'doctor',
    'info',
    'build',
    'test',
    'lint',
    'format',
    'typecheck',
    'clean',
    'config',
    'env',
    'openapi',
    'add',
    'update',
    'logs',
    'completion',
] as const;

/** Every tab-completable root token: the routes plus the `db` namespace and the two aliases. */
export const COMPLETION_WORDS: readonly string[] = [...CLI_ROUTE_NAMES, 'db', 'g', 'routes'];
