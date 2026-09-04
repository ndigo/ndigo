/** @author Jeff Rose */

import { describe, test, expect } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryEntityManager } from '../src/entity-manager';
import { InMemoryTransactionManager } from '../src/transaction-manager';
import { transactional } from '../src/decorators';
import { entity, primaryColumn, column } from '../src/index';

@entity()
class Account {
    @primaryColumn()
    id!: string;

    @column()
    name!: string;
}

class AccountService {
    transactionManager: InMemoryTransactionManager;
    #em: InMemoryEntityManager;

    constructor(dataSource: InMemoryDataSource, em: InMemoryEntityManager) {
        this.transactionManager = new InMemoryTransactionManager(dataSource);
        this.#em = em;
    }

    @transactional()
    async create(id: string, name: string): Promise<void> {
        const account = new Account();
        account.id = id;
        account.name = name;
        this.#em.persist(account);
    }

    @transactional()
    async createThenThrow(id: string, name: string): Promise<void> {
        const account = new Account();
        account.id = id;
        account.name = name;
        this.#em.persist(account);
        throw new Error('boom');
    }
}

describe('@transactional with InMemoryTransactionManager snapshot rollback', () => {
    test('commit keeps entity-manager writes', async () => {
        const ds = new InMemoryDataSource();
        ds.init();
        const em = new InMemoryEntityManager(ds);
        const service = new AccountService(ds, em);

        await service.create('a1', 'Alice');
        expect(em.find(Account, 'a1')).toMatchObject({ id: 'a1', name: 'Alice' });
        em.clear();
        ds.destroy();
    });

    test('rollback restores the data source on throw', async () => {
        const ds = new InMemoryDataSource();
        ds.init();
        const em = new InMemoryEntityManager(ds);
        const service = new AccountService(ds, em);

        // Pre-existing row that must survive a rollback.
        const seeded = new Account();
        seeded.id = 'seed';
        seeded.name = 'Seed';
        em.persist(seeded);

        await expect(service.createThenThrow('b2', 'Bob')).rejects.toThrow('boom');

        // The failed transaction's write is gone.
        expect(em.find(Account, 'b2')).toBeUndefined();
        // Pre-existing data survived.
        expect(em.find(Account, 'seed')).toMatchObject({ id: 'seed' });

        em.clear();
        ds.destroy();
    });
});