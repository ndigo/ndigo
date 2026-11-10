/**
 * `ndigo openapi` — emit an OpenAPI document (fronts the app openapi script).
 */
import { buildCommand } from '@stricli/core';
import { captureAppOnce, resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';
import { jsonFlag, writeJson } from './_output.js';

const OPENAPI_HINT = 'add an "openapi" script that emits the spec (AD-70 manifest)';

/**
 * The OpenAPI emission command.
 */
export const openapiCommand = buildCommand({
    async func(flags: { out?: string; format?: 'json' | 'yaml'; json?: boolean }, dir: string) {
        const resolved = resolveAppDir(dir);
        if (flags.json === true) {
            if (flags.out !== undefined) {
                process.stderr.write('--json emits the document on stdout — omit --out\n');
                process.exitCode = 2;
                return;
            }
            if (flags.format === 'yaml') {
                process.stderr.write('--json requires the json format\n');
                process.exitCode = 2;
                return;
            }
            const result = await captureAppOnce(resolved, 'openapi', OPENAPI_HINT, ['--format', 'json']);
            if (result.exitCode !== 0) {
                process.stderr.write(result.stderr);
                process.exitCode = result.exitCode;
                return;
            }
            let document: unknown;
            try {
                document = JSON.parse(result.stdout);
            } catch {
                const detail = result.stderr.trim();
                process.stderr.write(
                    `"openapi" did not print a JSON document on stdout${detail === '' ? '' : `: ${detail}`}\n`
                );
                process.exitCode = 1;
                return;
            }
            writeJson(document);
            return;
        }

        const extra: string[] = [];
        if (flags.out) extra.push('--out', flags.out);
        if (flags.format) extra.push('--format', flags.format);
        process.exitCode = await runAppOnce(resolved, 'openapi', OPENAPI_HINT, extra);
    },
    parameters: {
        flags: {
            out: { kind: 'parsed', parse: (v: string) => v, brief: 'Output file path.', optional: true },
            format: { kind: 'enum', values: ['json', 'yaml'], brief: 'Output format.', optional: true },
            json: jsonFlag,
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
    docs: { brief: 'Emit an OpenAPI document (fronts the app openapi script)' },
});
