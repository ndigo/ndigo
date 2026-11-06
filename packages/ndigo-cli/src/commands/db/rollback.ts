/**
 * `ndigo db rollback` — front the application’s db:rollback script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

export const dbRollbackCommand = buildCommand({
    async func(flags: { db?: string }, dir: string, count: string) {
        const resolved = resolveAppDir(dir);
        const extra = flags.db ? ['--db', flags.db] : [];
        extra.push(count);
        process.exitCode = await runAppOnce(
            resolved,
            'db:rollback',
            'add a "db:rollback" script or use the adapter runner',
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
                {
                    parse: (v: string) => v,
                    brief: 'Number of migrations to roll back (default: 1).',
                    default: '1',
                    placeholder: 'count',
                },
            ],
        },
    },
    docs: { brief: 'Run the application’s db:rollback script' },
});
