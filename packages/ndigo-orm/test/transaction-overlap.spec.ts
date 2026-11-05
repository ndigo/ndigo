/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryTransactionManager } from '../src/transaction-manager';

describe('InMemoryTransactionManager overlap guard (DAT-F2)', () => {
    test('a second concurrent run rejects instead of racing the first', async () => {
        const dataSource = new InMemoryDataSource();
        dataSource.init();
        const transactionManager = new InMemoryTransactionManager(dataSource);

        let release: () => void = () => {};
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });

        const first = transactionManager.run(async () => {
            await gate;
            return 'first';
        });

        // The first run holds the snapshot; the second must fail loud rather
        // than take a second snapshot whose rollback would discard the first's
        // commits.
        await expect(transactionManager.run(() => 'second')).rejects.toThrow('already active');

        release();
        await expect(first).resolves.toBe('first');
        expect(transactionManager.isActive()).toBe(false);
        dataSource.destroy();
    });

    test('sequential runs succeed once the previous transaction settled', async () => {
        const dataSource = new InMemoryDataSource();
        dataSource.init();
        const transactionManager = new InMemoryTransactionManager(dataSource);

        await expect(transactionManager.run(() => 'one')).resolves.toBe('one');
        await expect(transactionManager.run(() => 'two')).resolves.toBe('two');
        expect(transactionManager.isActive()).toBe(false);
        dataSource.destroy();
    });
});
