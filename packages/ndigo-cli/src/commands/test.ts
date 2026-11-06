/**
 * `ndigo test` — front the application’s test script.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand as buildStricliCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

export const testCommand = buildStricliCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(resolved, 'test', 'add a "test" script to package.json');
    },
    parameters: {
        flags: {},
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'Run the application’s test script' },
});
