/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { AsyncResource } from 'node:async_hooks';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { entity, column, generatedColumn, primaryColumn } from '@ndigo/orm';
import type { AsyncRepository } from '@ndigo/orm';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { DrizzleTransactionManager } from '../src/drizzle-transaction-manager';
import { DrizzleUnitOfWork } from '../src/drizzle-unit-of-work';
import { DrizzleRepository } from '../src/drizzle-repository';

@entity('notes')
class Note {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(2) })
    title!: string;
}

let dataSource: DrizzleDataSource;
const directories: string[] = [];

beforeEach(async () => {
    dataSource = new DrizzleDataSource({ url: ':memory:' });
    await dataSource.init([Note]);
});

afterEach(async () => {
    for (const directory of directories.splice(0)) {
        // oxlint-disable-next-line no-await-in-loop -- sequential temp-dir cleanup keeps the spec deterministic.
        await rm(directory, { recursive: true, force: true });
    }
});

describe('DrizzleEntityManager', () => {
    test('persists, finds, and removes entities', async () => {
        const manager = new DrizzleEntityManager(dataSource);

        const note = new Note();
        note.title = 'hello';
        await manager.persist(note);
        expect(note.id).toBeGreaterThan(0); // generated PK read back

        const found = await manager.find(Note, note.id);
        expect(found?.title).toBe('hello');

        const all = await manager.findAll(Note);
        expect(all).toHaveLength(1);

        await manager.remove(note);
        expect(await manager.find(Note, note.id)).toBeUndefined();
    });

    test('validates entities against column schemas before persisting (AD-07)', async () => {
        const manager = new DrizzleEntityManager(dataSource);

        const note = new Note();
        note.title = 'x'; // fails z.string().min(2)
        await expect(manager.persist(note)).rejects.toThrow('Entity validation failed for fields: title');
    });
});

describe('DrizzleTransactionManager', () => {
    test('commits work on success', async () => {
        const manager = new DrizzleEntityManager(dataSource);
        const tx = new DrizzleTransactionManager(dataSource);

        await tx.run(async () => {
            const note = new Note();
            note.title = 'committed';
            await manager.persist(note);
        });

        expect(await manager.findAll(Note)).toHaveLength(1);
        expect(tx.isActive()).toBe(false);
    });

    test('rolls back work on error and rethrows', async () => {
        const manager = new DrizzleEntityManager(dataSource);
        const tx = new DrizzleTransactionManager(dataSource);

        await expect(
            tx.run(async () => {
                const note = new Note();
                note.title = 'rolled-back';
                await manager.persist(note);
                throw new Error('boom');
            })
        ).rejects.toThrow('boom');

        expect(await manager.findAll(Note)).toHaveLength(0);
        expect(tx.isActive()).toBe(false);
    });

    test('rejects nested transactions', async () => {
        const tx = new DrizzleTransactionManager(dataSource);
        await tx.run(() => {
            return expect(tx.run(() => Promise.resolve())).rejects.toThrow('already active');
        });
    });

    test('a concurrent run fails loud instead of racing a second BEGIN (DAT-F9)', async () => {
        const tx = new DrizzleTransactionManager(dataSource);
        let release: () => void = () => {};
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });

        const first = tx.run(async () => {
            await gate;
            return 'first';
        });

        // The latch must be claimed before BEGIN is awaited, so the concurrent
        // call is rejected cleanly rather than opening a nested transaction.
        await expect(tx.run(() => 'second')).rejects.toThrow('already active');

        release();
        await expect(first).resolves.toBe('first');
        expect(tx.isActive()).toBe(false);
    });

    // The boundary is bound to the async context that opened it: with a pooled
    // client (every statement gets its own connection) a statement issued from
    // another context must not be swept into — or out of — the transaction.
    test('statements from another async context stay out of the open transaction', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'ndigo-tx-'));
        directories.push(directory);
        const fileSource = new DrizzleDataSource({ url: `file:${join(directory, 'app.db')}` });
        await fileSource.init([]);
        await fileSource.client.execute('CREATE TABLE orders (id TEXT NOT NULL)');
        const tx = new DrizzleTransactionManager(fileSource);
        // Created before the transaction, like a context that belongs to another
        // in-flight request.
        const otherRequest = new AsyncResource('other-request');
        let outsideWrite: unknown;

        await expect(
            tx.run(async () => {
                await fileSource.client.execute("INSERT INTO orders VALUES ('inside')");
                outsideWrite = await otherRequest
                    .runInAsyncScope(() => fileSource.client.execute("INSERT INTO orders VALUES ('outside-during')"))
                    .catch((error: unknown) => error);
                throw new Error('rolled back');
            })
        ).rejects.toThrow('rolled back');

        // The outside statement ran on its own connection rather than inside the
        // transaction, and SQLite allows one writer per database: it was refused,
        // not silently enrolled (SQLITE_BUSY), and not silently committed inside a
        // transaction that then rolled back.
        expect(String(outsideWrite)).toMatch(/SQLITE_BUSY|database is locked/);

        // A write issued once the boundary has settled is unaffected by it.
        await fileSource.client.execute("INSERT INTO orders VALUES ('outside-after')");
        const rows = await fileSource.client.execute('SELECT id FROM orders ORDER BY id');
        expect(rows.rows.map((row) => row[0])).toEqual(['outside-after']);
    });

    // An in-memory database exists only on the connection that opened it, so the
    // client is capped at one connection: an unrelated statement cannot run
    // beside an open transaction. Fail loud rather than run it inside (and roll
    // it back with) someone else's transaction.
    test('a statement from another context during an in-memory transaction fails loud', async () => {
        const tx = new DrizzleTransactionManager(dataSource);
        const otherRequest = new AsyncResource('other-request');

        await expect(
            tx.run(() => otherRequest.runInAsyncScope(() => dataSource.client.execute('SELECT 1 AS other_request')))
        ).rejects.toThrow(/TRANSACTION_ACTIVE/);
        expect(tx.isActive()).toBe(false);
    });
});

describe('DrizzleUnitOfWork', () => {
    test('tracks entity states', () => {
        const manager = new DrizzleEntityManager(dataSource);
        const uow = new DrizzleUnitOfWork(manager);
        const note = new Note();

        uow.registerNew(note);
        expect(uow.getState(note)).toBe('new');

        uow.registerDirty(note);
        expect(uow.getState(note)).toBe('new'); // new wins

        uow.registerRemoved(note);
        expect(uow.getState(note)).toBe('removed'); // removal clears new
        expect(uow.getState(new Note())).toBeUndefined();
    });

    test('flushes new and dirty entities, then removes', async () => {
        const manager = new DrizzleEntityManager(dataSource);
        const uow = new DrizzleUnitOfWork(manager);

        const a = new Note();
        a.title = 'alice';
        const b = new Note();
        b.title = 'bob';
        uow.registerNew(a);
        uow.registerNew(b);
        await uow.flush();

        const all = await manager.findAll(Note);
        expect(all).toHaveLength(2);
        expect(all.map((n) => n.title).sort((a, b) => a.localeCompare(b))).toEqual(['alice', 'bob']);
        expect(uow.getState(a)).toBeUndefined(); // cleared after flush

        await uow.flush();
        expect(await manager.findAll(Note)).toHaveLength(2);
    });
});

describe('DrizzleRepository', () => {
    test('performs CRUD and counts', async () => {
        const manager = new DrizzleEntityManager(dataSource);
        const repo: AsyncRepository<Note, number> = new DrizzleRepository(Note, manager);

        expect(await repo.findById(999)).toBeUndefined();
        expect(await repo.existsById(999)).toBe(false);
        expect(await repo.deleteById(999)).toBe(false);

        const note = new Note();
        note.title = 'repo';
        const saved = await repo.save(note);

        expect(await repo.findById(saved.id)).toMatchObject({ title: 'repo' });
        expect(await repo.existsById(saved.id)).toBe(true);
        expect(await repo.count()).toBe(1);
        expect(await repo.findAll()).toHaveLength(1);
        expect(await repo.deleteById(saved.id)).toBe(true);
        expect(await repo.findById(saved.id)).toBeUndefined();
        expect(await repo.count()).toBe(0);
        expect(await repo.deleteById(saved.id)).toBe(false);
    });
});
