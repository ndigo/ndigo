/**
 * `ndigo openapi` — emit an OpenAPI document (fronts the app openapi script).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';

export const openapiCommand = buildCommand({
    async func(flags: { out?: string; format?: 'json' | 'yaml' }, dir: string) {
        const resolved = resolveAppDir(dir);
        const extra: string[] = [];
        if (flags.out) extra.push('--out', flags.out);
        if (flags.format) extra.push('--format', flags.format);
        process.exitCode = await runAppOnce(resolved, 'openapi', 'add an "openapi" script that emits the spec (AD-70 manifest)', extra);
    },
    parameters: {
        flags: {
            out: { kind: 'parsed', parse: (v: string) => v, brief: 'Output file path.', optional: true },
            format: { kind: 'enum', values: ['json', 'yaml'], brief: 'Output format.', optional: true },
        },
        positional: { kind: 'tuple', parameters: [
            { parse: (v: string) => v, brief: 'Application directory (default: current directory).', default: '.', placeholder: 'dir' },
        ] },
    },
    docs: { brief: 'Emit an OpenAPI document (fronts the app openapi script)' },
});