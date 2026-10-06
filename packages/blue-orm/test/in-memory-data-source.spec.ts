/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError } from '@blue/core';
import { InMemoryDataSource } from '../src/data-source';

describe('InMemoryDataSource', () => {
    let dataSource: InMemoryDataSource;

    beforeEach(() => {
        dataSource = new InMemoryDataSource();
    });

    describe('lifecycle', () => {
        it('initializes with destroyed = false', () => {
            expect(dataSource.destroyed).toBe(false);
        });

        it('init is callable without throwing', () => {
            expect(() => dataSource.init()).not.toThrow();
        });

        it('destroy clears stores and sets destroyed = true', () => {
            dataSource.createStore('users');
            dataSource.getStore('users').set(1, { id: 1 });

            dataSource.destroy();

            expect(dataSource.destroyed).toBe(true);
            expect(dataSource.hasStore('users')).toBe(false);
        });
    });

    describe('stores', () => {
        it('createStore creates a new store', () => {
            dataSource.createStore('users');

            expect(dataSource.hasStore('users')).toBe(true);
            expect(dataSource.getStore('users') instanceof Map).toBe(true);
        });

        it('hasStore returns true/false correctly', () => {
            expect(dataSource.hasStore('missing')).toBe(false);

            dataSource.createStore('users');

            expect(dataSource.hasStore('users')).toBe(true);
        });

        it('getStore returns the Map for existing store', () => {
            dataSource.createStore('users');
            const store = dataSource.getStore('users');
            store.set('a', 1);

            expect(store.get('a')).toBe(1);
        });

        it('getStore throws IllegalStateError for non-existent store', () => {
            expect(() => dataSource.getStore('missing')).toThrow(IllegalStateError);
        });

        it('clear removes all stores', () => {
            dataSource.createStore('users');
            dataSource.createStore('products');

            dataSource.clear();

            expect(dataSource.hasStore('users')).toBe(false);
            expect(dataSource.hasStore('products')).toBe(false);
        });

        it('creating a store twice does not overwrite existing data', () => {
            dataSource.createStore('users');
            const store = dataSource.getStore('users');
            store.set(1, { id: 1 });

            dataSource.createStore('users');

            expect(dataSource.getStore('users').get(1)).toEqual({ id: 1 });
        });
    });
});

// DA-3: rollback is a deep snapshot, not just store membership — entities are
// cloned so in-place mutations of pre-existing rows are reverted on restore.
class Account {
    constructor(
        public id: string,
        public name: string
    ) {}
}

describe('InMemoryDataSource snapshot/restore', () => {
    let dataSource: InMemoryDataSource;

    beforeEach(() => {
        dataSource = new InMemoryDataSource();
        dataSource.createStore('accounts');
    });

    it('rolls back in-place entity mutations on prototype-preserving clones', () => {
        const store = dataSource.getStore<Account>('accounts');
        const account = new Account('a1', 'Alice');
        store.set('a1', account);

        const snapshot = dataSource.snapshot();
        account.name = 'Mutated';
        store.set('a2', new Account('a2', 'Bob'));
        dataSource.restore(snapshot);

        const restoredStore = dataSource.getStore<Account>('accounts');
        expect(restoredStore.get('a2')).toBeUndefined();

        const restored = restoredStore.get('a1');
        expect(restored).toBeInstanceOf(Account);
        expect(restored).toMatchObject({ id: 'a1', name: 'Alice' });
        // Rollback reads return clones, not the mutated original reference.
        expect(restored).not.toBe(account);
    });

    it('re-points store keys when a primary key was reassigned', () => {
        const store = dataSource.getStore<Account>('accounts');
        const account = new Account('a1', 'Alice');
        store.set('a1', account);

        const snapshot = dataSource.snapshot();
        account.id = 'a2';
        store.delete('a1');
        store.set('a2', account);
        dataSource.restore(snapshot);

        const restoredStore = dataSource.getStore<Account>('accounts');
        expect(restoredStore.get('a2')).toBeUndefined();
        expect(restoredStore.get('a1')).toMatchObject({ id: 'a1', name: 'Alice' });
    });

    it('keeps the snapshot handle pristine across repeated restores', () => {
        const store = dataSource.getStore<Account>('accounts');
        store.set('a1', new Account('a1', 'Alice'));

        const snapshot = dataSource.snapshot();

        dataSource.restore(snapshot);
        const first = dataSource.getStore<Account>('accounts').get('a1');
        if (first === undefined) {
            throw new Error('snapshot restore lost the entity');
        }
        first.name = 'Mutated';

        dataSource.restore(snapshot);
        expect(dataSource.getStore<Account>('accounts').get('a1')).toMatchObject({ name: 'Alice' });
    });
});
