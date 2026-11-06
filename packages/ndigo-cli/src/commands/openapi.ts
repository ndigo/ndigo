/**
 * `ndigo openapi` — emit an OpenAPI document (fronts the app's openapi script).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

export const openapiCommand = buildCommand({
    async func(_flags: {}, dir: string) {
        const resolved = resolveAppDir(dir);
        process.exitCode = await runAppOnce(resolved, 'openapi', 'add an "openapi" script that emits the spec (AD-70 manifest)');
    },
    parameters: {
        flags: {},
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'Emit an OpenAPI document (fronts the app openapi script)' },
});