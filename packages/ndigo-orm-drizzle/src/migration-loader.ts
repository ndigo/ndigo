/**
 * Migration-file loading and boot wiring (AD-78).
 *
 * Generated migrations are one versioned module per file under a
 * `db/migrations` directory — `<NNNN>-<slug>.ts` (`.mts`/`.mjs` accepted by
 * the loader) — each exporting a `Migration` as its default export. The
 * runner contract (AD-30) is unchanged; these helpers only discover and
 * order the files, so `DrizzleMigrator` internals stay untouched.
 */
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DrizzleMigrator } from './drizzle-migrator';
import type { Migration, MigrationStatus } from './drizzle-migrator';
import { DrizzleDataSource } from './drizzle-data-source';

/** `0001-slug.ts` — the generated/scaffolded filename shape. */
const migrationFilePatternRule = /^(\d{4,})-[\w-]+\.(ts|mts|mjs)$/;

/**
 * Loads the migrations under `dir`, in filename order, as `Migration`s.
 *
 * Versions come from each module's exported `version` (filenames are
 * cosmetic — renames break nothing); `DrizzleMigrator.migrate` re-validates
 * and orders them through `orderedMigrations`. Dynamic imports are cached by
 * the runtime, so one loader instance is expected per process per directory.
 *
 * @param dir - The migrations directory.
 * @returns The loaded migrations, filename-sorted.
 */
export async function loadMigrations(dir: string): Promise<Migration[]> {
    let entries: string[] = [];
    try {
        entries = await readdir(dir);
    } catch (error) {
        if ((error as { code?: string }).code === 'ENOENT') {
            throw new Error(
                `loadMigrations: no migrations directory at "${dir}" — run \`ndigo db new\` to scaffold the first migration`,
                { cause: error }
            );
        }
        throw error;
    }

    const migrations: Migration[] = [];
    for (const file of entries.filter((entry) => migrationFilePatternRule.test(entry)).sort()) {
        // oxlint-disable-next-line no-await-in-loop -- migrations load sequentially so module evaluation stays deterministic; the specifier is a runtime-discovered migration file, so the import cannot be static.
        const module = (await import(pathToFileURL(join(dir, file)).href)) as { default?: Migration };
        const migration = module.default;
        if (migration === undefined || typeof migration.version !== 'number' || typeof migration.up !== 'function') {
            throw new Error(`loadMigrations: "${join(dir, file)}" does not export a Migration as its default export`);
        }
        migrations.push(migration);
    }
    return migrations;
}

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

/**
 * Options for {@link migrateOnBoot}.
 */
export interface MigrateOnBootOptions {
    /** The data source the migrations apply to. */
    dataSource: DrizzleDataSource;
    /** The migrations directory (`db/migrations` by convention). */
    dir: string;
}

/**
 * Applies all pending migrations at boot, **failing closed**: any loader or
 * migration error throws before serving starts — a boot that skips pending
 * DDL would serve against a stale schema. Journal semantics are AD-30's:
 * idempotent across restarts, one runner at a time (concurrent migrators
 * fail loud on the journal primary key).
 *
 * @param options - The data source and migrations directory.
 * @returns The post-run migration status, for boot logs.
 */
export async function migrateOnBoot(options: MigrateOnBootOptions): Promise<MigrationStatus[]> {
    const migrations = await loadMigrations(options.dir);
    const migrator = new DrizzleMigrator(options.dataSource);
    await migrator.migrate(migrations);
    return migrator.status(migrations);
}
