/**
 * `ndigo routes` — the application route list. Without `--json` this is the
 * `ndigo inspect` alias (the app's manifest printer); with `--json` it emits
 * only the manifest's routes.
 */
import { buildCommand } from '@stricli/core';
import { captureAppOnce, resolveAppDir, runAppOnce } from '../helpers/app-scripts.js';
import { jsonFlag, writeJson } from './_json.js';
import { appDirPositional } from './_script-fronts.js';

const INSPECT_HINT =
    'add an "inspect" script that builds and prints the manifest, e.g. "inspect": "tsx src/inspect.ts" (AD-70)';

/**
 * The route-list command.
 */
export const routesCommand = buildCommand({
    async func(flags: { json?: boolean }, dir: string) {
        const resolved = resolveAppDir(dir);
        if (flags.json !== true) {
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
        writeJson({ routes });
    },
    parameters: {
        flags: { json: jsonFlag },
        positional: {
            kind: 'tuple',
            parameters: [appDirPositional],
        },
    },
    docs: { brief: 'Print the application routes (--json emits the route list)' },
});
