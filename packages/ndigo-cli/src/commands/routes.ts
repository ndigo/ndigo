/**
 * `ndigo routes` — the application route list. Without `--json` this is the
 * `ndigo inspect` alias (the app's manifest printer); with `--json` it emits
 * only the manifest's routes.
 */
import { buildCommand } from '@stricli/core';
import { captureAppOnce, resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';
import { jsonFlag, pickFormat, toonFlag, writeJson, writeToon } from './_output.js';
import { appDirPositional } from './_script-fronts.js';

const INSPECT_HINT =
    'add an "inspect" script that builds and prints the manifest, e.g. "inspect": "tsx src/inspect.ts" (AD-70)';

/**
 * The route-list command.
 */
export const routesCommand = buildCommand({
    async func(flags: { json?: boolean; toon?: boolean }, dir: string) {
        const resolved = resolveAppDir(dir);
        const format = pickFormat(flags);
        if (format === undefined) {
            process.exitCode = await runAppOnce(resolved, 'inspect', INSPECT_HINT);
            return;
        }

        const result = await captureAppOnce(resolved, 'inspect', INSPECT_HINT);
        if (result.exitCode !== 0) {
            process.stderr.write(result.stderr);
            process.exitCode = result.exitCode;
            return;
        }
        let manifest: unknown;
        try {
            manifest = JSON.parse(result.stdout);
        } catch {
            const detail = result.stderr.trim();
            process.stderr.write(
                `"inspect" did not print a JSON manifest on stdout${detail === '' ? '' : `: ${detail}`}\n`
            );
            process.exitCode = 1;
            return;
        }
        const routes =
            typeof manifest === 'object' && manifest !== null && 'routes' in manifest && Array.isArray(manifest.routes)
                ? manifest.routes
                : undefined;
        if (routes === undefined) {
            process.stderr.write('"inspect" printed JSON without a routes array\n');
            process.exitCode = 1;
            return;
        }
        const output = { routes };
        if (format === 'toon') {
            // Uniform route records — the same tabular shape as `ui list`.
            await writeToon(output);
            return;
        }
        writeJson(output);
    },
    parameters: {
        flags: { json: jsonFlag, toon: toonFlag },
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Print the application routes (--json or --toon emits the route list)' },
});
