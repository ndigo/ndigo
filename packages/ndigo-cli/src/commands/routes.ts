/**
 * `ndigo routes` — print the application route table (fronts inspect).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

export const routesCommand = buildCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(resolved, 'inspect', 'add an "inspect" script (AD-70)');
    },
    parameters: {
        flags: {},
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
    docs: { brief: 'Print the application route table (fronts inspect)' },
});
