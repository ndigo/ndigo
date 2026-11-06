/**
 * `ndigo inspect` — run the application's declared `inspect` script (the
 * AD-70 introspection entry prints the app manifest without binding a
 * port). The introspection logic stays in `@ndigo/inspect`; the app owns
 * the wiring (AD-75 D-3, AD-70).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

/**
 * The application-manifest inspection command.
 */
export const inspectCommand = buildCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(
            resolved,
            'inspect',
            'add an "inspect" script that builds and prints the manifest, e.g. "inspect": "tsx src/inspect.ts" (AD-70)'
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
        brief: 'Print the application manifest (routes, mappings, config keys)',
        fullDescription:
            "Runs the app's scripts.inspect — the AD-70 introspection entry " +
            'that builds the manifest without listening. The wiring lives in ' +
            'the app (choose its controllers/config classes); @ndigo/inspect owns ' +
            'the introspection.',
    },
});