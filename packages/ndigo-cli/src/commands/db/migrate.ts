/**
 * `ndigo db migrate` — run the application's declared `db:migrate` script
 * (the journaled `DrizzleMigrator` runner assembly lives in the app; the
 * CLI fronts it with the one-shot process lifecycle, AD-75 D-2 — the
 * `db:new`/`db:generate`/`db:status` companions are AD-78).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

/**
 * The database migration command.
 */
export const dbMigrateCommand = buildCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(
            resolved,
            'db:migrate',
            'add a "db:migrate" script, e.g. "db:migrate": "tsx src/migrate.ts"'
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
        brief: 'Run the application’s db:migrate script',
        fullDescription:
            "Runs the app's scripts.db:migrate under the one-shot process " +
            'lifecycle (signal relay, exit-code propagation). The migrator ' +
            'assembly (DrizzleMigrator + the app’s data source) belongs to the ' +
            'app; `db new` scaffolds a migration, `db generate` renders one ' +
            'from entity metadata, and `db status` reports the journal (AD-78).',
    },
});