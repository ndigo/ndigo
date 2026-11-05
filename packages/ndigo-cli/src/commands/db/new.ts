/**
 * `ndigo db new` — scaffold the next versioned migration file (AD-78 D-5).
 *
 * CLI-owned: no app code runs — the command probes `db/migrations` under the
 * application directory for the highest `NNNN` prefix (via
 * `@ndigo/orm-drizzle`'s `nextMigrationVersion`, the loader's own contract) and
 * writes `<NNNN>-<slug>.ts` exporting an empty `Migration` for the author to
 * fill in. The filename is cosmetic; the runner orders by the exported
 * version.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Command, Args } from '@oclif/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { nextMigrationVersion } from '../../helpers/migration-probe.js';

/**
 * The database scaffold command.
 */
export class DbNewCommand extends Command {
    static summary = 'Scaffold the next versioned migration file';
    static description =
        'Writes db/migrations/<NNNN>-<slug>.ts under the application ' +
        'directory with the next free version and an empty `up` body — ' +
        'fill it in, then run `ndigo db migrate` (the runner orders by the ' +
        'exported version; the filename is cosmetic).';
    static examples = ['$ ndigo db new add-inbox-column', '$ ndigo db new ./apps/04-ndigo-api add-inbox-column'];

    static flags = {};

    static args = {
        dir: Args.string({
            summary: 'Application directory (default: current directory).',
            default: '.',
        }),
        slug: Args.string({
            summary: 'Short description used in the filename and journal (default: change).',
            default: 'change',
        }),
    };

    async run(): Promise<void> {
        const { args } = await this.parse();
        const dir = resolveAppDir(args.dir);
        const migrationsDir = join(dir, 'db', 'migrations');
        const version = await nextMigrationVersion(migrationsDir);
        const slug = args.slug
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
        const target = join(migrationsDir, `${String(version).padStart(4, '0')}-${slug}.ts`);

        await mkdir(migrationsDir, { recursive: true });
        await writeFile(target, renderScaffold(version, args.slug));
        this.log(`created ${target}`);
    }
}

/**
 * The scaffolded migration module — an empty `up` the author fills in.
 *
 * @param version - The migration version.
 * @param description - The journal description (the raw slug argument).
 * @returns The migration module source.
 */
function renderScaffold(version: number, description: string): string {
    return (
        '// Scaffolded by `ndigo db new` (AD-78) — the runner applies this in version order.\n' +
        "import type { Migration } from '@ndigo/orm-drizzle';\n" +
        '\n' +
        'const migration: Migration = {\n' +
        `    version: ${version},\n` +
        `    description: ${JSON.stringify(description)},\n` +
        '    up: (ctx) => {\n' +
        '        // ctx.execute(\'ALTER TABLE "notes" ADD COLUMN "title" TEXT\');\n' +
        '        // ctx.batch([\'CREATE INDEX idx_notes_title ON "notes" ("title")\']);\n' +
        '    },\n' +
        '};\n' +
        '\n' +
        'export default migration;\n'
    );
}
