/**
 * `ndigo serve` — run the application under the AD-74 supervisor: every
 * `SIGINT`/`SIGTERM` relays to the app (which runs its own graceful
 * shutdown); `--cluster <n>` replicates it across N worker slots with slot
 * env and `PORT` derivation.
 */
import { buildCommand, numberParser } from '@stricli/core';
import { resolveAppDir, runAppSupervised } from '../helpers/app-scripts.js';

/**
 * The application `serve` command.
 */
export const serveCommand = buildCommand({
    async func(flags: { cluster: number; port?: number }, dir: string) {
        const resolved = resolveAppDir(dir);
        const result = await runAppSupervised(
            resolved,
            'start',
            'add a "start" script, e.g. "start": "tsx src/index.ts"',
            {
                port: flags.port,
                cluster: flags.cluster,
            }
        );
        process.exitCode = result.exitCode;
        process.exit(result.exitCode);
    },
    parameters: {
        flags: {
            cluster: {
                kind: 'parsed',
                parse: numberParser,
                brief: 'Number of worker slots (default 1).',
                default: '1',
            },
            port: {
                kind: 'parsed',
                parse: numberParser,
                brief: 'Base PORT for every slot (default: inherited environment).',
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
        brief: 'Run the application with the cluster process lifecycle (AD-74)',
        fullDescription:
            "Runs the application's scripts.start (package.json + scripts.start at the " +
            'directory argument) under the @ndigo/cluster supervisor: signals relay ' +
            "into the app's own graceful shutdown, crashed slots respawn with " +
            'backoff, and — with --cluster — the app replicates across N worker ' +
            'slots (NDIGO_CLUSTER_SLOT/SIZE, PORT = --port + slot).',
    },
});
