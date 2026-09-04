/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { describe, test, expect, beforeAll } from 'vitest';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { entity, primaryColumn, generated, column } from '@blue/orm';

@entity('crud_users')
class CrudUser {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    constructor(name: string = '') {
        this.name = name;
    }
}

describe('DrizzleEntityManager CRUD', () => {
    let ds: DrizzleDataSource;
    let em: DrizzleEntityManager;

    beforeAll(async () => {
        ds = new DrizzleDataSource({ url: ':memory:' });
        await ds.init([CrudUser]);
        em = new DrizzleEntityManager(ds);
    });

    test('creates and retrieves entity', async () => {
        const user = new CrudUser('Alice');
        await em.persist(user);

        expect(user.id).toBeTypeOf('number');

        const found = await em.find(CrudUser, user.id!);
        expect(found).not.toBeNull();
        expect(found!.name).toBe('Alice');
    });

    test('creates and retrieves multiple entities', async () => {
        await em.persist(new CrudUser('Bob'));
        await em.persist(new CrudUser('Charlie'));

        const all = await em.findAll(CrudUser);
        expect(all.length).toBeGreaterThanOrEqual(3);
    });

    test('updates existing entity', async () => {
        const user = new CrudUser('Before');
        await em.persist(user);
        const id = user.id!;

        user.name = 'After';
        await em.persist(user);

        const updated = await em.find(CrudUser, id);
        expect(updated!.name).toBe('After');
    });

    test('deletes entity', async () => {
        const user = new CrudUser('DeleteMe');
        await em.persist(user);
        const id = user.id!;

        await em.remove(user);
        const gone = await em.find(CrudUser, id);
        expect(gone).toBeUndefined();
    });
});