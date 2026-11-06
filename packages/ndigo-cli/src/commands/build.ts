/**
 * `ndigo build` — front the application’s build script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand as buildStricliCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

export const buildScriptCommand = buildStricliCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(resolved, 'build', 'add a "build" script to package.json');
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
    docs: { brief: 'Run the application’s build script' },
});
