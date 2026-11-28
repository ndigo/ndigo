/**
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import {
    column,
    entity,
    generatedColumn,
    InMemoryDataSource,
    InMemoryEntityManager,
    manyToOne,
    oneToMany,
    postLoad,
    prePersist,
    preUpdate,
    postRemove,
    primaryColumn,
} from '@ndigo/orm';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';

// The Drizzle manager must fire the same entity hooks at the same
// points as InMemoryEntityManager — prePersist on insert, preUpdate on update,
// postLoad on every read, postRemove on remove.
@entity('lifecycle_parity')
class EntityHookNote {
    static events: string[] = [];

    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column({ type: 'text' })
    body = '';

    @prePersist()
    onPrePersist(): void {
        EntityHookNote.events.push('prePersist');
    }

    @postLoad()
    onPostLoad(): void {
        EntityHookNote.events.push('postLoad');
    }

    @preUpdate()
    onPreUpdate(): void {
        EntityHookNote.events.push('preUpdate');
    }

    @postRemove()
    onPostRemove(): void {
        EntityHookNote.events.push('postRemove');
    }
}

@entity('lifecycle_children')
class LifecycleChild {
    static loads = 0;

    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column({ type: 'text' })
    title = '';

    @column({ nullable: true })
    parentId: number | undefined;

    @manyToOne(() => LifecycleParent, { joinColumn: 'parentId' })
    parent: LifecycleParent | undefined;

    @postLoad()
    onPostLoad(): void {
        LifecycleChild.loads += 1;
    }
}

@entity('lifecycle_parents')
class LifecycleParent {
    static loads = 0;

    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column({ type: 'text' })
    name = '';

    @oneToMany(() => LifecycleChild, { inverseJoinColumn: 'parentId' })
    children: LifecycleChild[] = [];

    @postLoad()
    onPostLoad(): void {
        LifecycleParent.loads += 1;
    }
}

describe('DrizzleEntityManager lifecycle parity (DAT-F1)', () => {
    let dataSource: DrizzleDataSource;
    let entityManager: DrizzleEntityManager;

    beforeEach(async () => {
        EntityHookNote.events = [];
        LifecycleChild.loads = 0;
        LifecycleParent.loads = 0;
        dataSource = new DrizzleDataSource({ url: ':memory:' });
        await dataSource.init([EntityHookNote, LifecycleChild, LifecycleParent]);
        entityManager = new DrizzleEntityManager(dataSource);
    });

    test('fires prePersist on insert and preUpdate on a later save of the same row', async () => {
        const note = new EntityHookNote();
        note.body = 'first';

        await entityManager.persist(note);
        expect(EntityHookNote.events).toEqual(['prePersist']);

        note.body = 'second';
        await entityManager.persist(note);
        // Before the fix every save fired prePersist, never preUpdate.
        expect(EntityHookNote.events).toEqual(['prePersist', 'preUpdate']);
    });

    test('fires postLoad on find, findAll and a missing id fires nothing', async () => {
        const note = new EntityHookNote();
        note.body = 'loaded';
        await entityManager.persist(note);

        EntityHookNote.events = [];
        await entityManager.find(EntityHookNote, note.id);
        expect(EntityHookNote.events).toEqual(['postLoad']);

        EntityHookNote.events = [];
        await entityManager.findAll(EntityHookNote);
        expect(EntityHookNote.events).toEqual(['postLoad']);

        EntityHookNote.events = [];
        await entityManager.find(EntityHookNote, 9999);
        expect(EntityHookNote.events).toEqual([]);
    });

    test('fires postLoad on related rows fetched through fetchRelation and fetchRelations', async () => {
        const parent = new LifecycleParent();
        parent.name = 'Ada';
        await entityManager.persist(parent);

        const child = new LifecycleChild();
        child.title = 'First';
        child.parentId = parent.id;
        await entityManager.persist(child);

        LifecycleParent.loads = 0;
        LifecycleChild.loads = 0;

        const loadedChild = await entityManager.find(LifecycleChild, child.id);
        LifecycleChild.loads = 0;

        await entityManager.fetchRelation(loadedChild as object, 'parent');
        expect(LifecycleParent.loads).toBe(1);

        const loadedParent = await entityManager.find(LifecycleParent, parent.id);
        LifecycleParent.loads = 0;

        await entityManager.fetchRelations([loadedParent as object], ['children']);
        expect(LifecycleChild.loads).toBe(1);
    });

    test('fires postRemove after the row is removed', async () => {
        const note = new EntityHookNote();
        note.body = 'gone';
        await entityManager.persist(note);

        EntityHookNote.events = [];
        await entityManager.remove(note);

        expect(EntityHookNote.events).toEqual(['postRemove']);
        expect(await entityManager.find(EntityHookNote, note.id)).toBeUndefined();
    });

    test('runs the same hook sequence as InMemoryEntityManager', async () => {
        // In-memory run of the sequence.
        EntityHookNote.events = [];
        const memoryManager = new InMemoryEntityManager(new InMemoryDataSource());
        const memoryNote = new EntityHookNote();
        memoryNote.body = 'parity';
        memoryManager.persist(memoryNote);
        memoryManager.persist(memoryNote);
        memoryManager.find(EntityHookNote, memoryNote.id);
        memoryManager.findAll(EntityHookNote);
        memoryManager.remove(memoryNote);
        const memoryEvents = [...EntityHookNote.events];

        // Drizzle run of the same sequence.
        EntityHookNote.events = [];
        const drizzleNote = new EntityHookNote();
        drizzleNote.body = 'parity';
        await entityManager.persist(drizzleNote);
        await entityManager.persist(drizzleNote);
        await entityManager.find(EntityHookNote, drizzleNote.id);
        await entityManager.findAll(EntityHookNote);
        await entityManager.remove(drizzleNote);

        expect(EntityHookNote.events).toEqual(memoryEvents);
        expect(memoryEvents).toEqual(['prePersist', 'preUpdate', 'postLoad', 'postLoad', 'postRemove']);
    });
});
