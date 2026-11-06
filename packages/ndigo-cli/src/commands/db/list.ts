/**
 * `ndigo db list` — front the application’s db:list script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

export const dbListCommand = buildCommand({
    async func(flags: { db?: string }, dir: string) {
        const resolved = resolveAppDir(dir);
        const extra = flags.db ? ['--db', flags.db] : [];
        process.exitCode = await runAppOnce(resolved, 'db:list', 'add a "db:list" script or use the adapter runner (see docs/plans/2026-11-06_DB_ADAPTER_ABSTRACTION.md)', extra);
    },
    parameters: {
        flags: {
            db: { kind: 'parsed', parse: (v: string) => v, brief: 'Database adapter name.', optional: true },
        },
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'List registered database adapters', fullDescription: 'Prints the database adapters registered by the app (engine + default).' },
});
