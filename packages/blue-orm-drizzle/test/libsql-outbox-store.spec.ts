/**
 * `LibSQLOutboxStore` tests — including the transactional proof: an append
 * inside a `DrizzleTransactionManager` bracket commits and rolls back with
 * the business data on the same connection.
 *
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { delay } from '@blue/util';
import { JobHandlerRegistry, JobOutboxPublisher, JobQueue, JobRunner, OutboxRelay } from '@blue/jobs';
import { DrizzleDataSource, DrizzleTransactionManager, LibSQLJobStore, LibSQLOutboxStore } from '../src/index';

const stores: Array<{ close(): Promise<void> }> = [];
const directories: string[] = [];
afterEach(async () => {
    for (const store of stores) {
        // oxlint-disable-next-line no-await-in-loop -- close every store before the clients it may borrow
        await store.close();
    }
    for (const directory of directories) {
        // oxlint-disable-next-line no-await-in-loop -- isolated file handles must be released before directory cleanup
        await rm(directory, { recursive: true, force: true });
    }
    stores.length = directories.length = 0;
});

function openStore(): LibSQLOutboxStore {
    const store = new LibSQLOutboxStore({ url: ':memory:' });
    stores.push(store);
    return store;
}

describe('LibSQLOutboxStore', () => {
    test('append → claimPending → markPublished, with an exclusive lease', async () => {
        const store = openStore();

        const entry = await store.append({ type: 'order.placed', payload: { id: 'o1' } });
        expect(await store.size()).toBe(1);

        const claimed = await store.claimPending({ limit: 10, leaseMs: 1000 });
        expect(claimed).toEqual([entry]);
        expect(await store.claimPending({ limit: 10, leaseMs: 1000 })).toHaveLength(0);

        await store.markPublished(entry.id);
        expect(await store.size()).toBe(0);
    });

    test('an expired lease re-surfaces the entry; prune removes published history', async () => {
        const store = openStore();
        const entry = await store.append({ type: 'a' });
        await store.claimPending({ limit: 10, leaseMs: 1 });

        await delay(10);
        expect(await store.claimPending({ limit: 10, leaseMs: 1000 })).toHaveLength(1);

        await store.markPublished(entry.id);
        expect(await store.prunePublished(0)).toBe(1);
        expect(await store.prunePublished(0)).toBe(0);
    });

    test('append validates its input', async () => {
        const store = openStore();

        await expect(store.append({ type: '  ' })).rejects.toThrow(/non-empty string/);
    });
});

describe('transactional outbox on the application data source', () => {
    async function openTransactional(): Promise<{
        dataSource: DrizzleDataSource;
        transactionManager: DrizzleTransactionManager;
        outbox: LibSQLOutboxStore;
    }> {
        const directory = await mkdtemp(join(tmpdir(), 'blue-outbox-'));
        directories.push(directory);
        const dataSource = new DrizzleDataSource({ url: `file:${join(directory, 'app.db')}` });
        await dataSource.init([]);
        const outbox = new LibSQLOutboxStore({ client: dataSource.client });
        stores.push(outbox);
        return { dataSource, transactionManager: new DrizzleTransactionManager(dataSource), outbox };
    }

    test('a rolled-back transaction discards the outbox entry with the business write', async () => {
        const { dataSource, transactionManager, outbox } = await openTransactional();
        await dataSource.client.execute('CREATE TABLE orders (id TEXT NOT NULL)');

        await expect(
            transactionManager.run(async () => {
                await dataSource.client.execute("INSERT INTO orders VALUES ('o1')");
                await outbox.append({ type: 'order.placed', payload: { id: 'o1' } });
                throw new Error('payment declined');
            })
        ).rejects.toThrow('payment declined');

        const orders = await dataSource.client.execute('SELECT COUNT(*) FROM orders');
        expect(Number(orders.rows[0]?.[0])).toBe(0);
        expect(await outbox.size()).toBe(0);
    });

    test('a committed transaction leaves the entry for the relay', async () => {
        const { transactionManager, outbox } = await openTransactional();

        await transactionManager.run(async () => {
            await outbox.append({ type: 'order.placed', payload: { id: 'o2' } });
        });

        expect(await outbox.size()).toBe(1);
        const [claimed] = await outbox.claimPending({ leaseMs: 1000 });
        expect(claimed?.payload).toEqual({ id: 'o2' });
    });
});

describe('outbox → jobs end to end', () => {
    test('a committed outbox entry is relayed into the durable queue and executed', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'blue-outbox-e2e-'));
        directories.push(directory);
        const dataSource = new DrizzleDataSource({ url: `file:${join(directory, 'app.db')}` });
        await dataSource.init([]);
        const outbox = new LibSQLOutboxStore({ client: dataSource.client });
        const jobs = new LibSQLJobStore({ url: `file:${join(directory, 'jobs.db')}` });
        stores.push(outbox, jobs);
        const transactionManager = new DrizzleTransactionManager(dataSource);

        const queue = new JobQueue({ driver: jobs });
        const registry = new JobHandlerRegistry();
        const handled: unknown[] = [];
        registry.register('order.placed', (payload) => {
            handled.push(payload);
        });
        const runner = new JobRunner({ driver: jobs, registry, leaseMs: 1000 });
        const relay = new OutboxRelay({ store: outbox, publisher: new JobOutboxPublisher(queue), leaseMs: 1000 });

        await transactionManager.run(async () => {
            await outbox.append({ type: 'order.placed', payload: { id: 'o3' } });
        });

        expect(await relay.tick()).toBe(1);
        expect(await outbox.size()).toBe(0);
        expect(await jobs.size()).toBe(1);

        expect(await runner.tick()).toBe(1);
        await runner.drain();
        expect(handled).toEqual([{ id: 'o3' }]);
        expect(await jobs.size()).toBe(0);

        await relay.close();
        await runner.close();
    });
});
