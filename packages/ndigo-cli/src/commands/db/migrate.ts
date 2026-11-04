/**
 * `ndigo db migrate` — run the application's declared `db:migrate` script
 * (the journaled `DrizzleMigrator` runner assembly lives in the app; the
 * CLI fronts it with the one-shot process lifecycle, AD-75 D-2 — the
 * `db:new`/`db:generate`/`db:status` companions are AD-78).
 *
 * @module ndigo-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args } from '@oclif/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

/**
 * The database migration command.
 */
export class DbMigrateCommand extends Command {
    static summary = 'Run the application’s db:migrate script';
    static description =
        "Runs the app's scripts.db:migrate under the one-shot process " +
        'lifecycle (signal relay, exit-code propagation). The migrator ' +
        'assembly (DrizzleMigrator + the app’s data source) belongs to the ' +
        'app; `db new` scaffolds a migration, `db generate` renders one ' +
        'from entity metadata, and `db status` reports the journal (AD-78).';

    static examples = ['$ ndigo db migrate', '$ ndigo db migrate ./apps/04-ndigo-api'];

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
            'db:migrate',
            'add a "db:migrate" script, e.g. "db:migrate": "tsx src/migrate.ts"'
        );
    }
}
