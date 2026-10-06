/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { entity, generated, primaryColumn, column } from '@blue/orm';
import { DrizzleDataSource, createTableStatements } from '../src/drizzle-data-source';
import { DrizzleMigrator } from '../src/drizzle-migrator';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';

@entity('migrated_users')
class MigratedUser {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    @column()
    nickname: string = '';

    constructor(name: string = '') {
        this.name = name;
    }
}

@entity('migrated_users')
class MigratedUserV1 {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string = '') {
        this.name = name;
    }
}

/** A fresh in-memory data source per call, so tests never share state. */
function freshMigrator(): { ds: DrizzleDataSource; migrator: DrizzleMigrator } {
    const ds = new DrizzleDataSource({ url: ':memory:' });
    return { ds, migrator: new DrizzleMigrator(ds) };
}

describe('DrizzleMigrator (AD-30)', () => {
    test('applies pending migrations in ascending version order regardless of input order', async () => {
        const { migrator } = freshMigrator();
        const order: number[] = [];

        await migrator.migrate([
            {
                version: 2,
                description: 'second',
                up: () => {
                    order.push(2);
                },
            },
            {
                version: 1,
                description: 'first',
                up: () => {
                    order.push(1);
                },
            },
        ]);

        expect(order).toEqual([1, 2]);

        const rows = await migrator.status([
            { version: 1, description: 'first', up: () => undefined },
            { version: 2, description: 'second', up: () => undefined },
        ]);
        expect(rows.map((row) => row.state)).toEqual(['applied', 'applied']);
    });

    test('is idempotent across runs — each migration runs once', async () => {
        const { migrator } = freshMigrator();
        const calls: number[] = [];

        const migrations = [
            {
                version: 1,
                description: 'first',
                up: (): void => {
                    calls.push(1);
                },
            },
            {
                version: 2,
                description: 'second',
                up: (): void => {
                    calls.push(2);
                },
            },
        ];

        await migrator.migrate(migrations);
        await migrator.migrate(migrations);
        await migrator.migrate(migrations);

        expect(calls).toEqual([1, 2]);
    });

    test('status reports pending with no appliedAt, and applied with a timestamp', async () => {
        const { migrator } = freshMigrator();

        const status = await migrator.status([{ version: 7, description: 'future', up: () => undefined }]);
        expect(status).toEqual([{ version: 7, description: 'future', state: 'pending', appliedAt: undefined }]);

        await migrator.migrate([{ version: 7, description: 'future', up: () => undefined }]);

        const [applied] = await migrator.status([{ version: 7, description: 'future', up: () => undefined }]);
        expect(applied.state).toBe('applied');
        expect(applied.appliedAt).toBeTypeOf('string');
    });

    test('a failed migration leaves no journal row and retries cleanly', async () => {
        const { ds, migrator } = freshMigrator();

        const failed = {
            version: 1,
            description: 'should not land',
            up: async (): Promise<void> => {
                // The runner opens no transaction around `up`, so this
                // statement autocommitted before the failure and the table
                // persists (per-statement atomicity only) — the documented
                // degradation; the journal must not record it.
                await ds.client.execute('CREATE TABLE "rollback_target" (id INTEGER)');
                throw new Error('boom');
            },
        };

        await expect(migrator.migrate([failed])).rejects.toThrow('boom');

        const journal = await ds.client.execute('SELECT version FROM _blue_migrations');
        expect(journal.rows).toHaveLength(0);

        // The retried migration applies once the failure is gone.
        let retried = false;
        await migrator.migrate([
            {
                version: 1,
                description: 'fixed',
                up: (): void => {
                    retried = true;
                },
            },
        ]);
        expect(retried).toBe(true);
    });

    test('rejects duplicate and non-positive versions before any SQL runs', async () => {
        const { ds, migrator } = freshMigrator();

        const duplicates = [
            { version: 1, description: 'a', up: () => undefined },
            { version: 1, description: 'b', up: () => undefined },
        ];

        await expect(migrator.migrate(duplicates)).rejects.toThrow('duplicate migration version 1');

        // The journal was never created — validation ran before any SQL.
        const before = await ds.client.execute(
            `SELECT name FROM sqlite_master WHERE type = 'table' AND name = '_blue_migrations'`
        );
        expect(before.rows).toHaveLength(0);

        await expect(migrator.migrate([{ version: 0, description: 'zero', up: () => undefined }])).rejects.toThrow(
            'positive integer'
        );
    });

    test('a baseline migration from entity metadata supports persist/find without init()', async () => {
        const { ds, migrator } = freshMigrator();
        expect(ds.initialized).toBe(false);

        await migrator.migrate([
            {
                version: 1,
                description: 'initial schema',
                up: (ctx) => ctx.batch(createTableStatements([MigratedUser])),
            },
        ]);

        const em = new DrizzleEntityManager(ds);
        const user = new MigratedUser('Alice');
        await em.persist(user);

        const found = await em.find(MigratedUser, user.id);
        expect(found?.name).toBe('Alice');
    });

    test('evolves an existing schema — baseline then ALTER TABLE', async () => {
        const { ds, migrator } = freshMigrator();

        // The deployed baseline predates the nickname column; the current
        // entity shape carries it (schema lags code until v2 applies).
        await migrator.migrate([
            {
                version: 1,
                description: 'initial schema',
                up: (ctx) => ctx.batch(createTableStatements([MigratedUserV1])),
            },
            {
                version: 2,
                description: 'add nickname column',
                up: (ctx) => ctx.execute('ALTER TABLE "migrated_users" ADD COLUMN "nickname" TEXT'),
            },
        ]);

        const em = new DrizzleEntityManager(ds);
        const user = new MigratedUser('Alice');
        user.nickname = 'Al';
        await em.persist(user);

        const found = await em.find(MigratedUser, user.id);
        expect(found?.name).toBe('Alice');
        expect(found?.nickname).toBe('Al');
    });
});

describe('createTableStatements', () => {
    test('generates one CREATE TABLE per entity from metadata', () => {
        const statements = createTableStatements([MigratedUser]);

        expect(statements).toHaveLength(1);
        expect(statements[0]).toContain('CREATE TABLE IF NOT EXISTS "migrated_users"');
        expect(statements[0]).toContain('PRIMARY KEY');
        expect(statements[0]).toContain('"nickname"');
    });

    test('ignores classes without entity metadata', () => {
        expect(createTableStatements([class NotAnEntity {}])).toEqual([]);
    });
});
