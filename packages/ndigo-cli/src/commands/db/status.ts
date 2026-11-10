/**
 * `ndigo db status` — report the applied/pending state of every migration
 * (AD-78 D-5).
 *
 * Runs the app's declared `scripts.db:status` under the one-shot process
 * lifecycle; the app script prints `DrizzleMigrator.status()` rows — the
 * journal readback (`_ndigo_migrations`) is the app's, not the CLI's.
 */
import { buildCommand } from '@stricli/core';
import { captureAppOnce, resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';
import { jsonFlag, writeJson } from '../_json.js';

const STATUS_HINT = 'add a "db:status" script, e.g. "db:status": "tsx src/db-status.ts"';

/**
 * The database status command.
 */
export const dbStatusCommand = buildCommand({
    async func(flags: { json?: boolean }, dir: string) {
        const resolved = resolveAppDir(dir);
        if (flags.json === true) {
            const result = await captureAppOnce(resolved, 'db:status', STATUS_HINT);
            writeJson({ target: 'db:status', ...result });
            process.exitCode = result.exitCode;
            return;
        }
        process.exitCode = await runAppOnce(resolved, 'db:status', STATUS_HINT);
    },
    parameters: {
        flags: { json: jsonFlag },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: {
        brief: 'Report applied and pending migrations',
        fullDescription:
            "Runs the app's scripts.db:status under the one-shot process " +
            'lifecycle — the app script prints DrizzleMigrator.status() rows ' +
            'from the journal (AD-78).',
    },
});
