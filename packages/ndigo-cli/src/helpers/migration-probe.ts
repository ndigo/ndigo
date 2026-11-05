/**
 * Migration-version probing for scaffold commands (AD-78 D-5).
 *
 * Mirrors `@ndigo/orm-drizzle`'s loader filename contract — versions derive
 * from the `NNNN` prefix of `db/migrations/<NNNN>-<slug>.ts` files — so a
 * `ndigo db new` run can never produce a version the loader would not pick
 * up. Duplicated rather than imported: `@ndigo/cli` runs under plain Node on
 * compiled output, while `@ndigo/orm-drizzle`'s lib emits Bundler-style
 * extensionless imports (tsx/vite consumers). The parity spec
 * (`test/db-new.spec.ts`) pins the two implementations together.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { readdir } from 'node:fs/promises';

/** `0001-slug.ts` — the generated/scaffolded filename shape (loader contract). */
const migrationFilePatternRule = /^(\d{4,})-[\w-]+\.(ts|mts|mjs)$/;

/**
 * The next free migration version under `dir` — one past the highest
 * `NNNN`-prefixed filename (a missing directory counts as empty, so
 * scaffolding works before anything exists).
 *
 * @param dir - The migrations directory.
 * @returns The next version (1 for an empty or missing directory).
 */
export async function nextMigrationVersion(dir: string): Promise<number> {
    let entries: string[] = [];
    try {
        entries = await readdir(dir);
    } catch (error) {
        if ((error as { code?: string }).code === 'ENOENT') {
            return 1;
        }
        throw error;
    }

    let highest = 0;
    for (const entry of entries) {
        const match = migrationFilePatternRule.exec(entry);
        if (match) {
            highest = Math.max(highest, Number(match[1]));
        }
    }
    return highest + 1;
}
