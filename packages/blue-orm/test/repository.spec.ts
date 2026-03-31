/** @author opencode */

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
