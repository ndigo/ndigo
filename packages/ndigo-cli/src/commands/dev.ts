/**
 * `ndigo dev` — run the application's development script (vite for browser
 * apps, the app's `dev`/`start` for Node apps) under the supervisor
 * lifecycle. Server watch/hot-reload is documented as v1.1 (AD-75 D-2).
 */
import { buildCommand, numberParser } from '@stricli/core';
import { readAppManifest, resolveAppDir, runAppSupervised } from '../helpers/app-scripts.js';

/**
 * The development-loop command.
 */
export const devCommand = buildCommand({
    async func(flags: { port?: number }, dir: string) {
        const resolved = resolveAppDir(dir);
        const scripts = (readAppManifest(resolved)?.['scripts'] ?? {}) as Record<string, unknown>;
        const key = typeof scripts['dev'] === 'string' ? 'dev' : 'start';
        const hint =
            key === 'dev'
                ? 'add a "dev" script, e.g. "dev": "vite" — or a "start" script for Node apps'
                : 'add a "start" script, e.g. "start": "tsx src/index.ts"';
        const result = await runAppSupervised(resolved, key, hint, { port: flags.port });
        // Aligned with serve (review REV-016): runCluster leaves watch
        // handles behind, so both long-lived commands force-terminate with
        // the supervisor's exit code rather than draining the event loop.
        process.exit(result.exitCode);
    },
    parameters: {
        flags: {
            port: {
                kind: 'parsed',
                parse: numberParser,
                brief: 'PORT for the dev server (default: inherited environment).',
                optional: true,
            },
        },
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
            ],
        },
    },
    docs: {
        brief: 'Run the application’s development script (vite / dev / start)',
        fullDescription:
            'Runs scripts.dev when the app declares one (the browser-app vite ' +
            'convention), falling back to scripts.start (the Node-app convention). ' +
            'Server-side hot-reload (watch) is documented as v1.1; the supervisor ' +
            'lifecycle (signal relay, exit-code propagation) applies either way.',
    },
});
