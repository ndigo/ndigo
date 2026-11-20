/**
 */
import { describe, test, expect } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryEntityManager } from '../src/entity-manager';
import { InMemoryTransactionManager } from '../src/transaction-manager';
import {
    TransactionalInterceptor,
    transactional as transactionalDecorator,
    transactionalMethod,
} from '../src/decorators';
import { hasAnnotation, interceptMethods } from '@ndigo/advice';
import { entity as entityDecorator, primaryColumn, column } from '../src/index';

// Spec-side type wrappers; runtime-identical to the production decorators. The src decorators'
// signatures are intentionally loose (`ClassType` / `Function`) and get rigidly rejected under
// strict tsc at use sites, so the spec restores a valid `ClassDecorator` / method-decorator shape.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;
const transactional = transactionalDecorator as unknown as () => (
    target: Function,
    context: ClassMethodDecoratorContext
) => void;

/**
 * Advises an instance the way a container does — the decorator only declares,
 * so nothing is wrapped in a transaction until a rule matches.
 *
 * @param instance - The decorated instance to advise.
 * @returns The advised instance.
 */
function advise<T extends object>(instance: T): T {
    return interceptMethods(instance, [
        { when: hasAnnotation(transactionalMethod), use: new TransactionalInterceptor() },
    ]);
}

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
        const service = advise(new AccountService(ds, em));

        await service.create('a1', 'Alice');
        expect(em.find(Account, 'a1')).toMatchObject({ id: 'a1', name: 'Alice' });
        em.clear();
        ds.destroy();
    });

    test('rollback restores the data source on throw', async () => {
        const ds = new InMemoryDataSource();
        ds.init();
        const em = new InMemoryEntityManager(ds);
        const service = advise(new AccountService(ds, em));

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
        const service = advise(new AccountService(ds, em));

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

describe('@transactional nesting', () => {
    test('an inner transactional call joins the outer boundary instead of throwing', async () => {
        const ds = new InMemoryDataSource();
        ds.init();
        const em = new InMemoryEntityManager(ds);

        class ComposedService {
            transactionManager: InMemoryTransactionManager;
            #em: InMemoryEntityManager;

            constructor(dataSource: InMemoryDataSource, entityManager: InMemoryEntityManager) {
                this.transactionManager = new InMemoryTransactionManager(dataSource);
                this.#em = entityManager;
            }

            @transactional()
            async outer(id: string): Promise<void> {
                await this.inner(id);
            }

            @transactional()
            async inner(id: string): Promise<void> {
                const account = new Account();
                account.id = id;
                account.name = 'Inner';
                this.#em.persist(account);
            }

            @transactional()
            async failOuter(): Promise<void> {
                await this.innerThenThrow();
            }

            @transactional()
            async innerThenThrow(): Promise<void> {
                const account = new Account();
                account.id = 'nested-boom';
                account.name = 'Nested';
                this.#em.persist(account);
                throw new Error('nested boom');
            }
        }

        const service = advise(new ComposedService(ds, em));

        // Joining (not nesting) is what makes this work at all: both managers
        // reject an already-active transaction.
        await expect(service.outer('joined')).resolves.toBeUndefined();
        expect(em.find(Account, 'joined')).toMatchObject({ id: 'joined' });

        // The inner throw propagates and the OUTER boundary rolls back the
        // inner write — the joined call must not commit independently.
        await expect(service.failOuter()).rejects.toThrow('nested boom');
        expect(em.find(Account, 'nested-boom')).toBeUndefined();

        em.clear();
        ds.destroy();
    });
});
