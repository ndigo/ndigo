/**
 * `ndigo db new` — scaffold the next versioned migration file (AD-78 D-5).
 *
 * CLI-owned: no app code runs — the command probes `db/migrations` under the
 * application directory for the highest `NNNN` prefix (via
 * `@ndigo/orm-drizzle`'s `nextMigrationVersion`, the loader's own contract) and
 * writes `<NNNN>-<slug>.ts` exporting an empty `Migration` for the author to
 * fill in. The exported `version` drives apply order; the `NNNN` filename
 * prefix stays in lockstep with the loader's own filename contract.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { buildCommand } from '@stricli/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { resolveAppDir } from '../../helpers/app-scripts.js';
import { nextMigrationVersion } from '../../helpers/migration-probe.js';

/**
 * The database scaffold command.
 */
export const dbNewCommand = buildCommand({
    async func(_flags: {}, dir: string, slug: string) {
        const resolved = resolveAppDir(dir);
        const migrationsDir = join(resolved, 'db', 'migrations');
        const version = await nextMigrationVersion(migrationsDir);
        const normalized = slug
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase();
        const target = join(migrationsDir, `${String(version).padStart(4, '0')}-${normalized}.ts`);

        await mkdir(migrationsDir, { recursive: true });
        await writeFile(target, renderScaffold(version, slug));
        process.stdout.write(`created ${target}\n`);
    },
    parameters: {
        flags: {},
        positional: {
            kind: 'tuple',
            parameters: [
                {
                    parse: (value: string) => value,
                    brief: 'Application directory (default: current directory).',
                    default: '.',
                    placeholder: 'dir',
                },
                {
                    parse: (value: string) => value,
                    brief: 'Short description used in the filename and journal (default: change).',
                    default: 'change',
                    placeholder: 'slug',
                },
            ],
        },
    },
    docs: {
        brief: 'Scaffold the next versioned migration file',
        fullDescription:
            'Writes db/migrations/<NNNN>-<slug>.ts under the application ' +
            'directory with the next free version and an empty `up` body — ' +
            'fill it in, then run `ndigo db migrate` (the exported version ' +
            'drives apply order; the NNNN filename prefix follows the loader).',
    },
});

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
