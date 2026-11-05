/**
 * `ndigo db status` — report the applied/pending state of every migration
 * (AD-78 D-5).
 *
 * Runs the app's declared `scripts.db:status` under the one-shot process
 * lifecycle; the app script prints `DrizzleMigrator.status()` rows — the
 * journal readback (`_ndigo_migrations`) is the app's, not the CLI's.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args } from '@oclif/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

/**
 * The database status command.
 */
export class DbStatusCommand extends Command {
    static summary = 'Report applied and pending migrations';
    static description =
        "Runs the app's scripts.db:status under the one-shot process " +
        'lifecycle — the app script prints DrizzleMigrator.status() rows ' +
        'from the journal (AD-78).';
    static examples = ['$ ndigo db status', '$ ndigo db status ./apps/04-ndigo-api'];

    static flags = {};

    static args = {
        dir: Args.string({
            summary: 'Application directory (default: current directory).',
            default: '.',
        }),
    };

    async run(): Promise<void> {
        const { args } = await this.parse();
        const dir = resolveAppDir(args.dir);
        process.exitCode = await runAppOnce(
            dir,
            'db:status',
            'add a "db:status" script, e.g. "db:status": "tsx src/db-status.ts"'
        );
    }
}
