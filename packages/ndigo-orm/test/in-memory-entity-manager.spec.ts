/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { z } from 'zod';
import { IllegalStateError } from '@ndigo/core';
import { InMemoryDataSource } from '../src/data-source';
import {
    entity as entityDecorator,
    generatedColumn,
    primaryColumn,
    column,
    prePersist,
    postLoad,
    preUpdate,
    postRemove,
} from '../src/decorators';
import { InMemoryEntityManager } from '../src/entity-manager';

// Spec-side type wrapper: the src `entity` decorator's generic class-decorator signature is
// widened by strict tsc to `ClassType`; this cast restores a usable `ClassDecorator` signature
// without changing runtime behavior or the production decorator.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;

@entity()
class TestUser {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string) {
        this.id = undefined;
        this.name = name;
    }
}

@entity('custom_products')
class TestProduct {
    @primaryColumn()
    sku: string;

    @column()
    title: string;

    constructor(sku: string, title: string) {
        this.sku = sku;
        this.title = title;
    }
}

@entity()
class NoPrimaryEntity {
    @column()
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

class PlainClass {
    value!: string;
}

@entity()
class TrackedNote {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column()
    body!: string;

    @prePersist()
    onPrePersist() {}

    @postLoad()
    onPostLoad() {}

    @preUpdate()
    onPreUpdate() {}

    @postRemove()
    onPostRemove() {}
}

describe('InMemoryEntityManager', () => {
    let dataSource: InMemoryDataSource;
    let entityManager: InMemoryEntityManager;

    beforeEach(() => {
        dataSource = new InMemoryDataSource();
        entityManager = new InMemoryEntityManager(dataSource);
    });

    describe('persist', () => {
        it('stores entity by primary key', () => {
            const user = new TestUser('Ada');
            user.id = 10;

            entityManager.persist(user);

            const store = dataSource.getStore<TestUser>('TestUser');
            expect(store.get(10)).toBe(user);
        });

        it('auto-generates id for generated primary column', () => {
            const user = new TestUser('Grace');

            entityManager.persist(user);

            expect(user.id).toBe(1);
        });

        it('preserves manual id when provided', () => {
            const user = new TestUser('Linus');
            user.id = 42;

            entityManager.persist(user);

            expect(user.id).toBe(42);
        });

        it('throws IllegalStateError for non-entity class', () => {
            const plain = new PlainClass();
            expect(() => entityManager.persist(plain as unknown as TestUser)).toThrow(IllegalStateError);
        });

        it('throws IllegalStateError for entity without primary column', () => {
            const entity = new NoPrimaryEntity('missing');
            expect(() => entityManager.persist(entity)).toThrow(IllegalStateError);
        });

        it('increments generated ids across multiple persists', () => {
            const first = new TestUser('First');
            const second = new TestUser('Second');

            entityManager.persist(first);
            entityManager.persist(second);

            expect(first.id).toBe(1);
            expect(second.id).toBe(2);
        });
    });

    describe('find', () => {
        it('returns persisted entity', () => {
            const user = new TestUser('Ada');
            user.id = 7;
            entityManager.persist(user);

            expect(entityManager.find(TestUser, 7)).toBe(user);
        });

        it('returns undefined for non-existent id', () => {
            expect(entityManager.find(TestUser, 1)).toBeUndefined();
        });
    });

    describe('findAll', () => {
        it('returns all entities', () => {
            const first = new TestUser('A');
            first.id = 1;
            const second = new TestUser('B');
            second.id = 2;

            entityManager.persist(first);
            entityManager.persist(second);

            expect(entityManager.findAll(TestUser)).toEqual([first, second]);
        });

        it('returns empty array for unknown entity type', () => {
            expect(entityManager.findAll(TestProduct)).toEqual([]);
        });
    });

    describe('remove', () => {
        it('removes entity by primary key', () => {
            const user = new TestUser('Ada');
            user.id = 7;
            entityManager.persist(user);

            entityManager.remove(user);

            expect(entityManager.find(TestUser, 7)).toBeUndefined();
        });

        it('is a no-op if entity not in store', () => {
            const user = new TestUser('Ada');
            user.id = 7;

            expect(() => entityManager.remove(user)).not.toThrow();
        });
    });

    describe('clear', () => {
        it('removes all data', () => {
            const user = new TestUser('Ada');
            user.id = 7;
            entityManager.persist(user);

            entityManager.clear();

            expect(entityManager.find(TestUser, 7)).toBeUndefined();
        });
    });

    describe('lifecycle hooks', () => {
        beforeEach(() => {
            vi.clearAllMocks();
        });

        it('calls prePersist on new entity', () => {
            const spyPrePersist = vi.spyOn(TrackedNote.prototype, 'onPrePersist');
            const spyPreUpdate = vi.spyOn(TrackedNote.prototype, 'onPreUpdate');

            const note = new TrackedNote();
            note.body = 'hello';
            entityManager.persist(note);

            expect(spyPrePersist).toHaveBeenCalledTimes(1);
            expect(spyPreUpdate).not.toHaveBeenCalled();
        });

        it('calls preUpdate on existing entity', () => {
            const spyPrePersist = vi.spyOn(TrackedNote.prototype, 'onPrePersist');
            const spyPreUpdate = vi.spyOn(TrackedNote.prototype, 'onPreUpdate');

            const note = new TrackedNote();
            note.body = 'hello';
            entityManager.persist(note);
            spyPrePersist.mockClear();

            note.body = 'updated';
            entityManager.persist(note);

            expect(spyPrePersist).not.toHaveBeenCalled();
            expect(spyPreUpdate).toHaveBeenCalledTimes(1);
        });

        it('calls postLoad on find', () => {
            const spyPostLoad = vi.spyOn(TrackedNote.prototype, 'onPostLoad');

            const note = new TrackedNote();
            note.body = 'hello';
            entityManager.persist(note);
            spyPostLoad.mockClear();

            const found = entityManager.find(TrackedNote, 1);

            expect(spyPostLoad).toHaveBeenCalledTimes(1);
            expect(found).toBe(note);
        });

        it('calls postLoad on findAll', () => {
            const spyPostLoad = vi.spyOn(TrackedNote.prototype, 'onPostLoad');

            const note1 = new TrackedNote();
            note1.body = 'a';
            const note2 = new TrackedNote();
            note2.body = 'b';
            entityManager.persist(note1);
            entityManager.persist(note2);
            spyPostLoad.mockClear();

            const notes = entityManager.findAll(TrackedNote);

            expect(spyPostLoad).toHaveBeenCalledTimes(2);
            expect(notes).toHaveLength(2);
        });

        it('calls postRemove on remove', () => {
            const spyPostRemove = vi.spyOn(TrackedNote.prototype, 'onPostRemove');

            const note = new TrackedNote();
            note.body = 'hello';
            entityManager.persist(note);
            spyPostRemove.mockClear();

            entityManager.remove(note);

            expect(spyPostRemove).toHaveBeenCalledTimes(1);
        });
    });
});

describe('validate-on-persist integration', () => {
    @entity()
    class ValidatedUser {
        @generatedColumn()
        @primaryColumn()
        id: number | undefined;

        @column({ type: 'varchar', schema: z.string().min(2) })
        name: string;

        @column({ type: 'int', schema: z.number().min(18) })
        age: number;

        constructor(name: string, age: number) {
            this.name = name;
            this.age = age;
        }
    }

    let entityValidator: InMemoryEntityManager;

    beforeEach(() => {
        const ds = new InMemoryDataSource();
        entityValidator = new InMemoryEntityManager(ds);
    });

    test('persists valid entity', () => {
        const user = new ValidatedUser('Alice', 30);
        expect(() => entityValidator.persist(user)).not.toThrow();
    });

    test('throws when entity validation fails', () => {
        const user = new ValidatedUser('', 15);
        expect(() => entityValidator.persist(user)).toThrow('Entity validation failed for fields: name, age');
    });

    test('does not validate entities without declared column schemas', () => {
        @entity()
        class SimpleUser {
            @generatedColumn()
            @primaryColumn()
            id: number | undefined;

            @column()
            name: string = 'default';
        }

        const user = new SimpleUser();
        expect(() => entityValidator.persist(user)).not.toThrow();
    });
});
