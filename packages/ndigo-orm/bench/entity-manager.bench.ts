/**
 * InMemoryEntityManager lifecycle: insert, update, remove, find, findAll.
 *
 * Stores are prepared outside the timed body. Update, find, and findAll use
 * long-lived stores; insert and remove use a fresh store per iteration so the
 * measured operation is the manager call, not unbounded growth. Map rows are a
 * floor, not a persistence alternative.
 */
import { test } from 'vitest';
import '@tsmetadata/polyfill';
import { column, entity, generatedColumn, primaryColumn } from '../src/decorators';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryEntityManager } from '../src/entity-manager';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;

@entity()
class BenchUser {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: unknown = '') {
        this.id = undefined;
        this.name = String(name);
    }
}

function build(count: number): { dataSource: InMemoryDataSource; manager: InMemoryEntityManager } {
    const dataSource = new InMemoryDataSource();
    const manager = new InMemoryEntityManager(dataSource);
    for (let i = 0; i < count; i++) manager.persist(new BenchUser(`user-${i + 1}`));
    return { dataSource, manager };
}

const readStore = build(5);
const largeStore = build(1_000);
const hugeStore = build(10_000);

const updateStore = build(1);
const updateUser = updateStore.manager.findAll(BenchUser)[0];
assertEquivalent('update fixture count', updateStore.manager.findAll(BenchUser).length, 1);

const map = new Map<number, BenchUser>();
for (const user of largeStore.manager.findAll(BenchUser) as BenchUser[]) map.set(user.id as number, user);

let insertManager = new InMemoryEntityManager(new InMemoryDataSource());
let removeManager = new InMemoryEntityManager(new InMemoryDataSource());
let removeUser: BenchUser;
let batchManager = new InMemoryEntityManager(new InMemoryDataSource());
let batchUsers: BenchUser[] = [];

function resetInsert(): void {
    insertManager = new InMemoryEntityManager(new InMemoryDataSource());
}

function resetRemove(): void {
    removeManager = new InMemoryEntityManager(new InMemoryDataSource());
    removeUser = new BenchUser('remove-target');
    removeManager.persist(removeUser);
}

function resetBatch(): void {
    batchManager = new InMemoryEntityManager(new InMemoryDataSource());
    batchUsers = Array.from({ length: 100 }, (_, index) => new BenchUser(`batch-${index}`));
}

test('persist — insert path', async ({ bench }) => {
    resetInsert();
    await bench(benchName('persist(new entity)', BATCH), { beforeEach: resetInsert }, () => {
        for (let i = 0; i < BATCH; i++) insertManager.persist(new BenchUser(`insert-${i}`));
        retain(insertManager.findAll(BenchUser).length);
    }).run({ time: 2_000, warmupTime: 500 });
});

test('persist — update path', async ({ bench }) => {
    await bench(benchName('persist(existing entity)', BATCH), () => {
        for (let i = 0; i < BATCH; i++) updateStore.manager.persist(updateUser);
        retain(updateStore.manager.find(BenchUser, 1));
    }).run({ time: 2_000, warmupTime: 500 });
});

test('persist — batch insert (100 per iteration)', async ({ bench }) => {
    resetBatch();
    await bench(benchName('persist × 100', 100), { beforeEach: resetBatch }, () => {
        for (const user of batchUsers) batchManager.persist(user);
        retain(batchManager.findAll(BenchUser).length);
    }).run({ time: 2_000, warmupTime: 500 });
});

test('find — hit and miss', async ({ bench }) => {
    assertEquivalent('find hit identity', largeStore.manager.find(BenchUser, 1), map.get(1));
    assertEquivalent('find miss', largeStore.manager.find(BenchUser, 999_999), undefined);
    await bench.compare(
        bench(benchName('find(BenchUser, 1)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(largeStore.manager.find(BenchUser, 1));
        }),
        bench(benchName('Map.get(id)', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(map.get(1));
        }),
        bench(benchName('find miss', BATCH), () => {
            for (let i = 0; i < BATCH; i++) retain(largeStore.manager.find(BenchUser, 999_999));
        })
    );
});

test('findAll — 5 / 1,000 / 10,000 rows', async ({ bench }) => {
    assertEquivalent('findAll small', readStore.manager.findAll(BenchUser).length, 5);
    assertEquivalent('findAll large', largeStore.manager.findAll(BenchUser).length, 1_000);
    assertEquivalent('findAll huge', hugeStore.manager.findAll(BenchUser).length, 10_000);
    await bench.compare(
        bench('findAll — 5 rows', () => retain(readStore.manager.findAll(BenchUser))),
        bench('findAll — 1,000 rows', () => retain(largeStore.manager.findAll(BenchUser))),
        bench('findAll — 10,000 rows', () => retain(hugeStore.manager.findAll(BenchUser)))
    );
});

test('remove — existing entity', async ({ bench }) => {
    resetRemove();
    await bench(benchName('remove(existing)', 1), { beforeEach: resetRemove }, () => {
        removeManager.remove(removeUser);
        retain(removeManager.find(BenchUser, 1));
    }).run({ time: 2_000, warmupTime: 500 });
});
