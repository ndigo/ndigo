/**
 * `ndigo db seed` — front the application’s db:seed script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

/**
 * The app seed command.
 */
export const dbSeedCommand = buildCommand({
    async func(flags: { db?: string }, dir: string) {
        const resolved = resolveAppDir(dir);
        const extra = flags.db ? ['--db', flags.db] : [];
        process.exitCode = await runAppOnce(
            resolved,
            'db:seed',
            'add a "db:seed" script or use the adapter runner',
            extra
        );
    },
    parameters: {
        flags: {
            db: { kind: 'parsed', parse: (v: string) => v, brief: 'Database adapter name.', optional: true },
        },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (v: string) => v,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: { brief: 'Run the application’s db:seed script' },
});
