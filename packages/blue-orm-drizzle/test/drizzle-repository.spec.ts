/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { entity, generated, primaryColumn, column } from '@blue/orm';
import type { AsyncRepository } from '@blue/orm';
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { DrizzleRepository } from '../src/drizzle-repository';

@entity('paged_notes')
class PagedNote {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    title: string;

    @column()
    priority: number;

    constructor(title: string, priority: number) {
        this.title = title;
        this.priority = priority;
    }
}

const SEED: Array<[string, number]> = [
    ['epsilon', 5],
    ['delta', 4],
    ['gamma', 3],
    ['beta', 2],
    ['alpha', 1],
];

async function seededRepository(): Promise<AsyncRepository<PagedNote, number>> {
    const dataSource = new DrizzleDataSource({ url: ':memory:' });
    await dataSource.init([PagedNote]);
    return new DrizzleRepository(PagedNote, new DrizzleEntityManager(dataSource));
}

async function seed(repository: AsyncRepository<PagedNote, number>): Promise<void> {
    await Promise.all(SEED.map(([title, priority]) => repository.save(new PagedNote(title, priority))));
}

describe('DrizzleRepository.findPage', () => {
    test('pages over persisted rows with totals computed in SQL', async () => {
        const repository = await seededRepository();
        await seed(repository);

        const page = await repository.findPage({ page: 2, size: 2 });

        // No ORDER BY: rowid/insertion order — SEED inserts epsilon..alpha.
        expect(page.content.map((note) => note.title)).toEqual(['gamma', 'beta']);
        expect(page.page).toBe(2);
        expect(page.size).toBe(2);
        expect(page.totalElements).toBe(5);
        expect(page.totalPages).toBe(3);
    });

    test('sorts by a declared column in either direction', async () => {
        const repository = await seededRepository();
        await seed(repository);

        const ascending = await repository.findPage({ page: 1, size: 5, sort: [{ property: 'priority' }] });
        expect(ascending.content.map((note) => note.title)).toEqual(['alpha', 'beta', 'gamma', 'delta', 'epsilon']);

        const descending = await repository.findPage({
            page: 1,
            size: 5,
            sort: [{ property: 'priority', direction: 'desc' }],
        });
        expect(descending.content.map((note) => note.title)).toEqual(['epsilon', 'delta', 'gamma', 'beta', 'alpha']);
    });

    test('applies multi-key sorts in clause order', async () => {
        const repository = await seededRepository();

        await repository.save(new PagedNote('alpha', 3));
        await repository.save(new PagedNote('priority3-b', 3));
        await repository.save(new PagedNote('beta', 1));

        const page = await repository.findPage({
            page: 1,
            size: 10,
            sort: [{ property: 'priority', direction: 'desc' }, { property: 'title' }],
        });
        expect(page.content.map((row) => row.title)).toEqual(['alpha', 'priority3-b', 'beta']);
    });

    test('returns empty content for pages beyond the last', async () => {
        const repository = await seededRepository();
        await seed(repository);

        const page = await repository.findPage({ page: 9, size: 2 });

        expect(page.content).toEqual([]);
        expect(page.totalElements).toBe(5);
        expect(page.totalPages).toBe(3);
    });

    test('fails loud on unknown sort properties before any SQL runs', async () => {
        const repository = await seededRepository();
        await repository.save(new PagedNote('only', 1));

        await expect(repository.findPage({ page: 1, size: 2, sort: [{ property: 'missing' }] })).rejects.toThrow(
            'unknown sort property "missing"'
        );
    });

    test('findAllWhere validates condition columns and limit (SEC-3)', async () => {
        const dataSource = new DrizzleDataSource({ url: ':memory:' });
        await dataSource.init([PagedNote]);
        const manager = new DrizzleEntityManager(dataSource);

        // Column names are the allowlisted boundary — injected identifiers are rejected.
        await expect(manager.findAllWhere(PagedNote, [{ columnName: 'title" OR 1=1 --', value: 'x' }])).rejects.toThrow(
            /declared entity columns/
        );
        // The runtime boundary also rejects untyped callers' non-integer limits.
        await expect(
            manager.findAllWhere(PagedNote, [], { limit: '1; DROP TABLE paged_notes' as unknown as number })
        ).rejects.toThrow(/non-negative integer/);
        // The declared-column path still works.
        const rows = await manager.findAllWhere(PagedNote, [{ columnName: 'priority', value: 1 }]);
        expect(rows).toEqual([]);
    });
});
