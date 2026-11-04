/**
 *
 * Benchmark suite for InMemoryEntityManager CRUD operation throughput.
 *
 * Scenarios:
 *   1. persist (update path, single)   – upsert an already-persisted entity 1 000× per iteration
 *   2. persist (update path, batch ×10)– upsert 10 already-persisted entities 1 000× per iteration
 *   3. find hit (id = 1)               – find an entity that exists in the store
 *   4. find miss (id = 9 999)          – find an entity whose key is absent
 *   5. findAll small (5 entities)      – full-scan of a 5-record store
 *   6. findAll large (50 entities)     – full-scan of a 50-record store
 *   7. remove (repeat calls)           – remove on same entity; key absent after first call
 */

import { test } from 'vitest';
import '@tsmetadata/polyfill';
import { entity, generatedColumn, primaryColumn, column } from '../src/decorators';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryEntityManager } from '../src/entity-manager';

/* ------------------------------------------------------------------ */
/*  Entity definition                                                  */
/* ------------------------------------------------------------------ */

@entity()
class BenchUser {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string) {
        this.id = undefined;
        this.name = name;
    }
}

/* ------------------------------------------------------------------ */
/*  One-time data setup (module level – not per-iteration)            */
/* ------------------------------------------------------------------ */

// --- read-only store: 50 entities pre-populated (ids 1..50)
const dsRead = new InMemoryDataSource();
const emRead = new InMemoryEntityManager(dsRead);
for (let i = 0; i < 50; i++) {
    emRead.persist(new BenchUser(`user-${i + 1}`));
}

// --- small read-only store: 5 entities (ids 1..5)
const dsSmall = new InMemoryDataSource();
const emSmall = new InMemoryEntityManager(dsSmall);
for (let i = 0; i < 5; i++) {
    emSmall.persist(new BenchUser(`small-${i + 1}`));
}

// --- mutable store: single entity pre-persisted (id = 1)
const dsMutable = new InMemoryDataSource();
const emMutable = new InMemoryEntityManager(dsMutable);
const mutableUser = new BenchUser('mutable');
emMutable.persist(mutableUser); // id auto-assigned → 1

// --- batch of 10 users pre-persisted into mutable store (ids 2..11)
const batchUsers: BenchUser[] = [];
for (let i = 0; i < 10; i++) {
    const u = new BenchUser(`batch-${i + 1}`);
    emMutable.persist(u);
    batchUsers.push(u);
}

// --- store for remove bench: single pre-persisted entity
const dsRemove = new InMemoryDataSource();
const emRemove = new InMemoryEntityManager(dsRemove);
const removeUser = new BenchUser('remove-target');
emRemove.persist(removeUser); // id auto-assigned → 1

let _sink: unknown = 0;

/* ------------------------------------------------------------------ */
/*  Benchmarks                                                         */
/* ------------------------------------------------------------------ */

test('InMemoryEntityManager – persist (update path, single entity)', async ({ bench }) => {
    await bench('persist(mutableUser)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            emMutable.persist(mutableUser);
            count++;
        }
        _sink = count;
    }).run();
});

test('InMemoryEntityManager – persist (update path, batch × 10)', async ({ bench }) => {
    await bench('persist × 10', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            for (const u of batchUsers) {
                emMutable.persist(u);
                count++;
            }
        }
        _sink = count;
    }).run();
});

test('InMemoryEntityManager – find hit (id = 1)', async ({ bench }) => {
    await bench('find(BenchUser, 1)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            count += emRead.find(BenchUser, 1) ? 1 : 0;
        }
        _sink = count;
    }).run();
});

test('InMemoryEntityManager – find miss (id = 9999)', async ({ bench }) => {
    await bench('find(BenchUser, 9999)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            count += emRead.find(BenchUser, 9999) ? 1 : 0;
        }
        _sink = count;
    }).run();
});

test('InMemoryEntityManager – findAll small (5 entities)', async ({ bench }) => {
    await bench('findAll(BenchUser) × 5', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            count += emSmall.findAll(BenchUser).length;
        }
        _sink = count;
    }).run();
});

test('InMemoryEntityManager – findAll large (50 entities)', async ({ bench }) => {
    await bench('findAll(BenchUser) × 50', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            count += emRead.findAll(BenchUser).length;
        }
        _sink = count;
    }).run();
});

test('InMemoryEntityManager – remove (repeat calls on same entity)', async ({ bench }) => {
    await bench('remove(removeUser)', () => {
        let count = 0;
        for (let i = 0; i < 1000; i++) {
            emRemove.remove(removeUser);
            count++;
        }
        _sink = count;
    }).run();
});
