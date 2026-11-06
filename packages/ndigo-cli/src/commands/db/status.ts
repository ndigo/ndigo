/**
 * `ndigo db status` — report the applied/pending state of every migration
 * (AD-78 D-5).
 *
 * Runs the app's declared `scripts.db:status` under the one-shot process
 * lifecycle; the app script prints `DrizzleMigrator.status()` rows — the
 * journal readback (`_ndigo_migrations`) is the app's, not the CLI's.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

/**
 * The database status command.
 */
export const dbStatusCommand = buildCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(
            resolved,
            'db:status',
            'add a "db:status" script, e.g. "db:status": "tsx src/db-status.ts"'
        );
    },
    parameters: {
        flags: {},
        positional: { kind: 'tuple', parameters: [
            {
                parse: (value: string) => value,
                brief: 'Application directory (default: current directory).',
                default: '.',
                placeholder: 'dir',
            },
        ] },
    },
    docs: {
        brief: 'Report applied and pending migrations',
        fullDescription:
            "Runs the app's scripts.db:status under the one-shot process " +
            'lifecycle — the app script prints DrizzleMigrator.status() rows ' +
            'from the journal (AD-78).',
    },
});