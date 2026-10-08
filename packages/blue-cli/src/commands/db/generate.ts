/**
 * `blue db generate` — generate the next migration from the application's
 * entity metadata (AD-78 D-2/D-5).
 *
 * Like `db migrate`, the generation assembly (entities, migrations dir,
 * snapshot path) belongs to the app: the CLI runs the app's declared
 * `scripts.db:generate` under the one-shot process lifecycle, and the app
 * script writes `db/migrations/<NNNN>-<slug>.ts` plus the committed
 * `db/schema.json` projection. Both artifacts are committed and freshness-
 * gated, so a generate run at HEAD is a no-op.
 *
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args } from '@oclif/core';
import { resolveAppDir, runAppOnce } from '../../helpers/app-scripts.js';

/**
 * The database generation command.
 */
export class DbGenerateCommand extends Command {
    static summary = 'Generate the next migration from the app’s entity metadata';
    static description =
        "Runs the app's scripts.db:generate under the one-shot process " +
        'lifecycle. The generator (entities, snapshot, migrations dir) ' +
        'belongs to the app; the CLI fronts it — the app script writes the ' +
        'versioned migration file and rewrites db/schema.json for review.';
    static examples = ['$ blue db generate', '$ blue db generate ./apps/04-blue-api'];

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
            'db:generate',
            'add a "db:generate" script, e.g. "db:generate": "tsx src/db-generate.ts"'
        );
    }
}
