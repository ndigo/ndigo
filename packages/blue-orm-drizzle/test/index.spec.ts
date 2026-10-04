/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, expect, test } from 'vitest';
import { z } from 'zod';
import { entity, column, generated, primaryColumn } from '@blue/orm';
import type { AsyncRepository } from '@blue/orm';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { DrizzleTransactionManager } from '../src/drizzle-transaction-manager';
import { DrizzleUnitOfWork } from '../src/drizzle-unit-of-work';
import { DrizzleRepository } from '../src/drizzle-repository';

@entity('notes')
class Note {
    @generated()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar', schema: z.string().min(2) })
    title!: string;
}

let dataSource: DrizzleDataSource;

beforeEach(async () => {
    dataSource = new DrizzleDataSource({ url: ':memory:' });
    await dataSource.init([Note]);
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

    test('validates entities against column schemas before persisting (AD-7)', async () => {
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
        expect(all.map((n) => n.title).sort()).toEqual(['alice', 'bob']);
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
