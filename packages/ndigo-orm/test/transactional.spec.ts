/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryEntityManager } from '../src/entity-manager';
import { InMemoryTransactionManager } from '../src/transaction-manager';
import { transactional as transactionalDecorator } from '../src/decorators';
import { entity as entityDecorator, primaryColumn, column } from '../src/index';

// Spec-side type wrappers; runtime-identical to the production decorators. The src decorators'
// signatures are intentionally loose (`ClassType` / `Function`) and get rigidly rejected under
// strict tsc at use sites, so the spec restores a valid `ClassDecorator` / method-decorator shape.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;
const transactional = transactionalDecorator as unknown as () => (
    target: Function,
    context: ClassMethodDecoratorContext
) => void;

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

    @transactional()
    async mutateThenThrow(id: string, name: string): Promise<void> {
        const account = this.#em.find(Account, id);
        if (!account) {
            throw new Error(`account '${id}' not found`);
        }
        account.name = name;
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

    test('rollback reverts in-place mutations of pre-existing entities', async () => {
        const ds = new InMemoryDataSource();
        ds.init();
        const em = new InMemoryEntityManager(ds);
        const service = new AccountService(ds, em);

        const seeded = new Account();
        seeded.id = 'seed';
        seeded.name = 'Seed';
        em.persist(seeded);

        await expect(service.mutateThenThrow('seed', 'Mutated')).rejects.toThrow('boom');

        // The store-visible row is back to its pre-transaction values; reads
        // after a restore return clones, so metadata lookups must still work.
        expect(em.find(Account, 'seed')).toMatchObject({ id: 'seed', name: 'Seed' });

        em.clear();
        ds.destroy();
    });
});
