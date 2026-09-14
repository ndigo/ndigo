/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { InMemoryDataSource } from '../src/data-source';
import { column, entity, generated, primaryColumn } from '../src/decorators';
import { InMemoryEntityManager } from '../src/entity-manager';
import { InMemoryRepository } from '../src/repository';

@entity()
class TestUser {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string) {
        this.id = undefined;
        this.name = name;
    }
}

describe('InMemoryRepository', () => {
    let entityManager: InMemoryEntityManager;
    let repository: InMemoryRepository<TestUser, number>;

    beforeEach(() => {
        const dataSource = new InMemoryDataSource();
        entityManager = new InMemoryEntityManager(dataSource);
        repository = new InMemoryRepository(TestUser, entityManager);
    });

    describe('save', () => {
        it('persists and returns entity', () => {
            const user = new TestUser('Ada');

            const result = repository.save(user);

            expect(result).toBe(user);
            expect(user.id).toBe(1);
        });
    });

    describe('findById', () => {
        it('returns entity', () => {
            const user = new TestUser('Ada');
            repository.save(user);

            expect(repository.findById(user.id as number)).toBe(user);
        });

        it('returns undefined for missing id', () => {
            expect(repository.findById(123)).toBeUndefined();
        });
    });

    describe('findAll', () => {
        it('returns all entities', () => {
            const first = new TestUser('Ada');
            const second = new TestUser('Grace');
            repository.save(first);
            repository.save(second);

            expect(repository.findAll()).toEqual([first, second]);
        });
    });

    describe('deleteById', () => {
        it('removes and returns true', () => {
            const user = new TestUser('Ada');
            repository.save(user);

            expect(repository.deleteById(user.id as number)).toBe(true);
            expect(repository.findById(user.id as number)).toBeUndefined();
        });

        it('returns false for non-existent id', () => {
            expect(repository.deleteById(999)).toBe(false);
        });
    });

    describe('count', () => {
        it('returns correct count', () => {
            repository.save(new TestUser('Ada'));
            repository.save(new TestUser('Grace'));

            expect(repository.count()).toBe(2);
        });
    });

    describe('existsById', () => {
        it('returns true/false correctly', () => {
            const user = new TestUser('Ada');
            repository.save(user);

            expect(repository.existsById(user.id as number)).toBe(true);
            expect(repository.existsById(999)).toBe(false);
        });
    });

    describe('full lifecycle', () => {
        it('supports create, read, update, delete', () => {
            const user = new TestUser('Ada');
            repository.save(user);

            const loaded = repository.findById(user.id as number);
            expect(loaded).toBe(user);

            user.name = 'Ada Lovelace';
            repository.save(user);

            const updated = repository.findById(user.id as number);
            expect(updated?.name).toBe('Ada Lovelace');

            expect(repository.deleteById(user.id as number)).toBe(true);
            expect(repository.findById(user.id as number)).toBeUndefined();
        });
    });
});

describe('derived queries', () => {
    class UserRepository extends InMemoryRepository<TestUser, number> {
        findByName(name: string): TestUser[] {
            return this.derive('findByName', [name]);
        }

        findByNameAndId(name: string, id: number): TestUser[] {
            return this.derive('findByNameAndId', [name, id]);
        }
    }

    let entityManager: InMemoryEntityManager;
    let repository: UserRepository;

    beforeEach(() => {
        const dataSource = new InMemoryDataSource();
        entityManager = new InMemoryEntityManager(dataSource);
        repository = new UserRepository(TestUser, entityManager);
        repository.save(new TestUser('Ada'));
        repository.save(new TestUser('Grace'));
    });

    it('findByName returns matching entities', () => {
        const matches = repository.findByName('Ada');
        expect(matches).toHaveLength(1);
        expect(matches[0]?.name).toBe('Ada');
    });

    it('findByName is case-insensitive on the property, exact on the value', () => {
        expect(repository.findByName('grace')).toHaveLength(0);
        expect(repository.findByName('Grace')).toHaveLength(1);
    });

    it('findByNameAndId requires both conditions', () => {
        const ada = entityManager.findAll(TestUser).find((u) => u.name === 'Ada');
        expect(ada).toBeDefined();
        expect(repository.findByNameAndId('Ada', ada?.id as number)).toHaveLength(1);
        expect(repository.findByNameAndId('Ada', 999)).toHaveLength(0);
    });

    it('unsupported derived method names throw', () => {
        expect(() => repository.derive('findByNameLike', ['Ada'])).toThrow(TypeError);
        expect(() => repository.derive('deleteByName', ['Ada'])).toThrow(TypeError);
    });
});
