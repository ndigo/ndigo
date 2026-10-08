/**
 * `blue db migrate` — run the application's declared `db:migrate` script
 * (the journaled `DrizzleMigrator` runner assembly lives in the app; the
 * CLI fronts it with the one-shot process lifecycle, AD-75 D-2).
 *
 * @module blue-cli
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
        'app; GAP-7’s blue db generate will extend this topic with the ' +
        'CLI-owned generation path.';

    static examples = ['$ blue db migrate', '$ blue db migrate ./apps/04-blue-api'];

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
