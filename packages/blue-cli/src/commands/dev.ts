/**
 * `blue dev` — run the application's development script (vite for browser
 * apps, the app's `dev`/`start` for Node apps) under the supervisor
 * lifecycle. Server watch/hot-reload is documented as v1.1 (AD-75 D-2).
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args, Flags } from '@oclif/core';
import { readAppManifest, resolveAppDir, runAppSupervised } from '../helpers/app-scripts.js';

/**
 * The development-loop command.
 */
export class DevCommand extends Command {
    static summary = 'Run the application’s development script (vite / dev / start)';
    static description =
        'Runs scripts.dev when the app declares one (the browser-app vite ' +
        'convention), falling back to scripts.start (the Node-app convention). ' +
        'Server-side hot-reload (watch) is documented as v1.1; the supervisor ' +
        'lifecycle (signal relay, exit-code propagation) applies either way.';

    static examples = ['$ blue dev', '$ blue dev ./apps/15-blue-resilience-lab --port 3200'];

    static flags = {
        port: Flags.integer({
            summary: 'PORT for the dev server (default: inherited environment).',
            min: 1,
        }),
    };

    static args = {
        dir: Args.string({
            summary: 'Application directory (default: current directory).',
            default: '.',
        }),
    };

    async run(): Promise<void> {
        const { args, flags } = await this.parse();
        const dir = resolveAppDir(args.dir);
        const scripts = (readAppManifest(dir)?.['scripts'] ?? {}) as Record<string, unknown>;
        // Browser apps declare `dev` (vite); Node apps declare `start`.
        const key = typeof scripts['dev'] === 'string' ? 'dev' : 'start';
        const hint =
            key === 'dev'
                ? 'add a "dev" script, e.g. "dev": "vite" — or a "start" script for Node apps'
                : 'add a "start" script, e.g. "start": "tsx src/index.ts"';
        const result = await runAppSupervised(dir, key, hint, { port: flags.port });
        process.exitCode = result.exitCode;
    }
}
