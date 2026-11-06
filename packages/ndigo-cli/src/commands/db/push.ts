/**
 * `ndigo db push` — front the application’s db:push script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

export const dbPushCommand = buildCommand({
    async func(flags: { db?: string }, dir: string) {
        const resolved = resolveAppDir(dir);
        const extra = flags.db ? ['--db', flags.db] : [];
        process.exitCode = await runAppOnce(
            resolved,
            'db:push',
            'add a "db:push" script or use the adapter runner',
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
    docs: { brief: 'Run the application’s db:push script' },
});
