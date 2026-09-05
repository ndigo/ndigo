import '@tsmetadata/polyfill';

import { InMemoryDataSource } from '../src/data-source';
import { column, entity, generated, primaryColumn } from '../src/decorators';
import { InMemoryEntityManager } from '../src/entity-manager';
import { InMemoryUnitOfWork } from '../src/unit-of-work';

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

describe('InMemoryUnitOfWork', () => {
    let unitOfWork: InMemoryUnitOfWork;
    let entityManager: InMemoryEntityManager;

    beforeEach(() => {
        const dataSource = new InMemoryDataSource();
        entityManager = new InMemoryEntityManager(dataSource);
        unitOfWork = new InMemoryUnitOfWork(entityManager);
    });

    describe('registerNew', () => {
        it('sets state to new', () => {
            const user = new TestUser('Ada');

            unitOfWork.registerNew(user);

            expect(unitOfWork.getState(user)).toBe('new');
        });
    });

    describe('registerDirty', () => {
        it('sets state to managed', () => {
            const user = new TestUser('Ada');

            unitOfWork.registerDirty(user);

            expect(unitOfWork.getState(user)).toBe('managed');
        });

        it('is ignored for new entities', () => {
            const user = new TestUser('Ada');

            unitOfWork.registerNew(user);
            unitOfWork.registerDirty(user);

            expect(unitOfWork.getState(user)).toBe('new');
        });

        it('is ignored for removed entities', () => {
            const user = new TestUser('Ada');

            unitOfWork.registerRemoved(user);
            unitOfWork.registerDirty(user);

            expect(unitOfWork.getState(user)).toBe('removed');
        });
    });

    describe('registerRemoved', () => {
        it('sets state to removed', () => {
            const user = new TestUser('Ada');

            unitOfWork.registerRemoved(user);

            expect(unitOfWork.getState(user)).toBe('removed');
        });

        it('clears new state when removed', () => {
            const user = new TestUser('Ada');

            unitOfWork.registerNew(user);
            unitOfWork.registerRemoved(user);

            expect(unitOfWork.getState(user)).toBe('removed');
        });
    });

    describe('getState', () => {
        it('returns undefined for untracked entities', () => {
            const user = new TestUser('Ada');
            expect(unitOfWork.getState(user)).toBeUndefined();
        });
    });

    describe('flush', () => {
        it('persists new entities, persists dirty entities, and removes removed entities', () => {
            const newUser = new TestUser('New');
            const dirtyUser = new TestUser('Dirty');
            dirtyUser.id = 10;
            entityManager.persist(dirtyUser);

            const removedUser = new TestUser('Removed');
            removedUser.id = 20;
            entityManager.persist(removedUser);

            unitOfWork.registerNew(newUser);
            unitOfWork.registerDirty(dirtyUser);
            unitOfWork.registerRemoved(removedUser);

            unitOfWork.flush();

            expect(entityManager.find(TestUser, newUser.id as number)).toBe(newUser);
            expect(entityManager.find(TestUser, dirtyUser.id as number)).toBe(dirtyUser);
            expect(entityManager.find(TestUser, removedUser.id as number)).toBeUndefined();
        });

        it('clears all tracking after execution', () => {
            const user = new TestUser('Ada');
            unitOfWork.registerNew(user);

            unitOfWork.flush();

            expect(unitOfWork.getState(user)).toBeUndefined();
        });
    });

    describe('clear', () => {
        it('clears all tracking sets', () => {
            const user = new TestUser('Ada');
            unitOfWork.registerNew(user);

            unitOfWork.clear();

            expect(unitOfWork.getState(user)).toBeUndefined();
        });
    });
});
