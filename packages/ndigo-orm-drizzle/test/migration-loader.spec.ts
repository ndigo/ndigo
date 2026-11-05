/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { loadMigrations, nextMigrationVersion, migrateOnBoot } from '../src/migration-loader';

/** Runs `fn` against a fresh temp directory, deleted afterwards. */
async function withDir(fn: (dir: string) => Promise<void>): Promise<void> {
    const dir = await mkdtemp('ndigo-migrations-');
    try {
        await fn(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

const MIGRATION_1 = `export default { version: 1, description: 'first', up: (ctx) => ctx.execute('CREATE TABLE "one" ("id" INTEGER NOT NULL)') };`;
const MIGRATION_2 = `export default { version: 2, description: 'second', up: (ctx) => ctx.execute('CREATE TABLE "two" ("id" INTEGER NOT NULL)') };`;

describe('loadMigrations / nextMigrationVersion (AD-78 D-1)', () => {
    test('loads matching modules in filename order, ignoring foreign files', () =>
        withDir(async (dir) => {
            await writeFile(join(dir, '0002-second.mjs'), MIGRATION_2);
            await writeFile(join(dir, '0001-first.mjs'), MIGRATION_1);
            await writeFile(join(dir, 'README.md'), 'not a migration');

            const migrations = await loadMigrations(dir);
            expect(migrations.map((m) => m.version)).toEqual([1, 2]);
            expect(migrations.map((m) => m.description)).toEqual(['first', 'second']);
        }));

    test('versions come from the module export, not the filename', () =>
        withDir(async (dir) => {
            // Filename renames must not change what applies.
            await writeFile(join(dir, '0001-renamed.mjs'), MIGRATION_1);
            const migrations = await loadMigrations(dir);
            expect(migrations).toHaveLength(1);
            expect(migrations[0]?.version).toBe(1);
        }));

    test('fails loud on a module that does not export a Migration', () =>
        withDir(async (dir) => {
            await writeFile(join(dir, '0001-bad.mjs'), 'export default { nope: true };');
            await expect(loadMigrations(dir)).rejects.toThrow(/does not export a Migration/);
        }));

    test('throws with a scaffold hint when the directory is missing', async () => {
        await expect(loadMigrations('/nonexistent/migrations')).rejects.toThrow(/ndigo db new/);
    });

    test('nextMigrationVersion probes the highest NNNN prefix plus one', () =>
        withDir(async (dir) => {
            await writeFile(join(dir, '0001-first.mjs'), MIGRATION_1);
            await writeFile(join(dir, '0003-third.mjs'), MIGRATION_2);
            await writeFile(join(dir, 'notes.md'), 'junk');
            expect(await nextMigrationVersion(dir)).toBe(4);
        }));

    test('nextMigrationVersion treats an empty or missing directory as version 1', async () => {
        await withDir(async (dir) => {
            expect(await nextMigrationVersion(dir)).toBe(1);
        });
        expect(await nextMigrationVersion('/nonexistent/migrations')).toBe(1);
    });
});

describe('migrateOnBoot (AD-78 D-4)', () => {
    test('applies pending migrations and reports them applied; a second boot is a no-op', () =>
        withDir(async (dir) => {
            await writeFile(join(dir, '0001-first.mjs'), MIGRATION_1);
            await writeFile(join(dir, '0002-second.mjs'), MIGRATION_2);
            const dataSource = new DrizzleDataSource({ url: ':memory:' });

            const first = await migrateOnBoot({ dataSource, dir });
            expect(first.every((row) => row.state === 'applied')).toBe(true);
            expect(first.map((row) => row.version)).toEqual([1, 2]);

            await migrateOnBoot({ dataSource, dir });
            const { rows } = (await dataSource.client.execute(`SELECT COUNT(*) FROM "_ndigo_migrations"`)) as {
                rows: Array<Record<string, number>>;
            };
            // Journal count proves the second boot re-applied nothing.
            expect(rows[0]?.['COUNT(*)']).toBe(2);
        }));

    test('fails closed: a throwing migration aborts boot and is not journaled', () =>
        withDir(async (dir) => {
            await writeFile(join(dir, '0001-first.mjs'), MIGRATION_1);
            await writeFile(
                join(dir, '0002-boom.mjs'),
                `export default { version: 2, description: 'boom', up: () => { throw new Error('boom'); } };`
            );
            const dataSource = new DrizzleDataSource({ url: ':memory:' });

            await expect(migrateOnBoot({ dataSource, dir })).rejects.toThrow('boom');
            const { rows } = (await dataSource.client.execute(`SELECT version FROM "_ndigo_migrations"`)) as {
                rows: Array<Record<string, number>>;
            };
            expect(rows.map((row) => row.version)).toEqual([1]);
        }));
});
