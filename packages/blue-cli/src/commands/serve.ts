/**
 * `blue serve` — run the application under the AD-74 supervisor: every
 * `SIGINT`/`SIGTERM` relays to the app (which runs its own graceful
 * shutdown); `--cluster <n>` replicates it across N worker slots with slot
 * env and `PORT` derivation.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args, Flags } from '@oclif/core';
import { resolveAppDir, runAppSupervised } from '../helpers/app-scripts.js';

/**
 * The application `serve` command.
 */
export class ServeCommand extends Command {
    static summary = 'Run the application with the cluster process lifecycle (AD-74)';
    static description =
        "Runs the application's scripts.start (package.json + scripts.start at the " +
        'directory argument) under the @blue/cluster supervisor: signals relay ' +
        "into the app's own graceful shutdown, crashed slots respawn with " +
        'backoff, and — with --cluster — the app replicates across N worker ' +
        'slots (BLUE_CLUSTER_SLOT/SIZE, PORT = --port + slot).';

    static examples = [
        '$ blue serve',
        '$ blue serve ./apps/04-blue-api --port 3000',
        '$ blue serve --cluster 4 --port 3000',
    ];

    static flags = {
        cluster: Flags.integer({
            summary: 'Number of worker slots (default 1).',
            default: 1,
            min: 1,
        }),
        port: Flags.integer({
            summary: 'Base PORT for every slot (default: inherited environment).',
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
        const result = await runAppSupervised(dir, 'start', 'add a "start" script, e.g. "start": "tsx src/index.ts"', {
            port: flags.port,
            cluster: flags.cluster,
        });
        process.exitCode = result.exitCode;
    }
}
