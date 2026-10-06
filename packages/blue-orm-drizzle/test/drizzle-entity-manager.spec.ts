/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect, beforeAll } from 'vitest';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { entity, primaryColumn, generated, column } from '@blue/orm';

@entity('crud_users')
class CrudUser {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string = '') {
        this.name = name;
    }
}

// Client-assigned PK so the upsert fallback's UPDATE targets a caller-chosen id
// and can match zero rows when the INSERT failed for a non-PK reason.
@entity('crud_conflicted')
class ConflictedUser {
    @primaryColumn()
    id: number;

    @column()
    username: string;

    @column()
    email: string;

    constructor(id: number, username: string, email: string) {
        this.id = id;
        this.username = username;
        this.email = email;
    }
}

// DA-2: declared column types must be decoded on read — boolean cells arrive
// as SQLite 0/1 representations ('0.0'/'1.0' under the boolean column's TEXT
// affinity) and json cells as their stringified text, so a load→modify→save
// flow failed boolean validation.
@entity('typed_flags')
class TypedFlag {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column({ type: 'boolean' })
    enabled: boolean;

    @column({ type: 'json' })
    payload: Record<string, unknown>;

    constructor(enabled: boolean = false, payload: Record<string, unknown> = {}) {
        this.enabled = enabled;
        this.payload = payload;
    }
}

describe('DrizzleEntityManager CRUD', () => {
    let ds: DrizzleDataSource;
    let em: DrizzleEntityManager;

    beforeAll(async () => {
        ds = new DrizzleDataSource({ url: ':memory:' });
        await ds.init([CrudUser]);
        em = new DrizzleEntityManager(ds);
    });

    test('creates and retrieves entity', async () => {
        const user = new CrudUser('Alice');
        await em.persist(user);

        expect(user.id).toBeTypeOf('number');

        const found = await em.find(CrudUser, user.id);
        expect(found).not.toBeNull();
        // The row was just inserted above, so the read-back entity must exist.
        if (found === undefined) {
            throw new Error('persisted entity could not be read back');
        }
        expect(found.name).toBe('Alice');
    });

    test('creates and retrieves multiple entities', async () => {
        await em.persist(new CrudUser('Bob'));
        await em.persist(new CrudUser('Charlie'));

        const all = await em.findAll(CrudUser);
        expect(all.length).toBeGreaterThanOrEqual(3);
    });

    test('updates existing entity', async () => {
        const user = new CrudUser('Before');
        await em.persist(user);
        const id = user.id;

        user.name = 'After';
        await em.persist(user);

        const updated = await em.find(CrudUser, id);
        // persist() backfilled the id, so the updated row must exist.
        if (updated === undefined) {
            throw new Error('updated entity could not be read back');
        }
        expect(updated.name).toBe('After');
    });

    test('deletes entity', async () => {
        const user = new CrudUser('DeleteMe');
        await em.persist(user);
        const id = user.id;

        await em.remove(user);
        const gone = await em.find(CrudUser, id);
        expect(gone).toBeUndefined();
    });
});

// COR-12: persist must not mask non-conflict INSERT failures. A UNIQUE index on
// a column other than the PK makes a conflicting insert mislead the upsert
// fallback into matching zero rows.
describe('DrizzleEntityManager persist conflict handling (COR-12)', () => {
    let ds: DrizzleDataSource;
    let em: DrizzleEntityManager;

    beforeAll(async () => {
        ds = new DrizzleDataSource({ url: ':memory:' });
        await ds.init([ConflictedUser]);
        await ds.client.execute(
            'CREATE UNIQUE INDEX IF NOT EXISTS idx_crud_conflicted_username ON "crud_conflicted" (username)'
        );
        em = new DrizzleEntityManager(ds);
    });

    test('duplicate primary key upserts instead of throwing', async () => {
        await em.persist(new ConflictedUser(10, 'alice', 'alice@example.com'));
        await em.persist(new ConflictedUser(10, 'alice', 'alice@new.example.com'));

        // Same client-assigned PK: the INSERT collides on the PK and the
        // fallback UPDATE matches the existing row (rowsAffected = 1) — the
        // save is treated as an upsert and must resolve without error.
        const found = await em.find(ConflictedUser, 10);
        expect(found?.id).toBe(10);
        expect(found?.email).toBe('alice@new.example.com');
    });

    test('non-PK UNIQUE violation propagates the original error, no silent success', async () => {
        await em.persist(new ConflictedUser(20, 'bob', 'bob@example.com'));

        // New PK (21) but a username already held by row 20: the INSERT fails on
        // the UNIQUE username constraint, and the fallback UPDATE for id 21
        // matches zero rows — the original error must propagate.
        await expect(em.persist(new ConflictedUser(21, 'bob', 'bob2@example.com'))).rejects.toThrow();

        // Nothing was written for the failed save.
        expect(await em.find(ConflictedUser, 21)).toBeUndefined();
    });
});

describe('DrizzleEntityManager column-type decoding (DA-2)', () => {
    let ds: DrizzleDataSource;
    let em: DrizzleEntityManager;

    beforeAll(async () => {
        ds = new DrizzleDataSource({ url: ':memory:' });
        await ds.init([TypedFlag]);
        em = new DrizzleEntityManager(ds);
    });

    test('round-trips declared boolean and json column values', async () => {
        const onFlag = new TypedFlag(true, { tags: ['alpha'], count: 2 });
        const offFlag = new TypedFlag(false, { tags: [] });
        await em.persist(onFlag);
        await em.persist(offFlag);

        const reloadedOn = await em.find(TypedFlag, onFlag.id);
        expect(reloadedOn?.enabled).toBe(true);
        expect(reloadedOn?.payload).toEqual({ tags: ['alpha'], count: 2 });

        // false must come back as boolean false, not 0/'0.0'.
        const reloadedOff = await em.find(TypedFlag, offFlag.id);
        expect(reloadedOff?.enabled).toBe(false);
    });

    test('load-modify-save round-trips decoded values through validation', async () => {
        const flag = new TypedFlag(false, { tags: [] });
        await em.persist(flag);

        const loaded = await em.find(TypedFlag, flag.id);
        if (loaded === undefined) {
            throw new Error('persisted entity could not be read back');
        }
        expect(loaded.enabled).toBe(false);

        loaded.enabled = true;
        (loaded.payload.tags as string[]).push('beta');

        // Before decoding, the raw '0.0' cell string failed boolean validation here.
        await em.persist(loaded);

        const reloaded = await em.find(TypedFlag, flag.id);
        expect(reloaded?.enabled).toBe(true);
        expect(reloaded?.payload).toEqual({ tags: ['beta'] });
    });
});
