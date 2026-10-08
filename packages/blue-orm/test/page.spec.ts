/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { column, entity as entityDecorator, generated, primaryColumn } from '../src/decorators';
import { InMemoryEntityManager } from '../src/entity-manager';

// Spec-side type wrapper; runtime-identical to the production `entity` decorator.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;
import { InMemoryRepository } from '../src/repository';
import { pageFromAll, validatePageRequest, SortDirection } from '../src/page';

@entity('page_things')
class PageThing {
    @generated()
    @primaryColumn()
    id: number | undefined;

    @column()
    name: string;

    @column()
    score: number;

    constructor(name: string, score: number) {
        this.name = name;
        this.score = score;
    }
}

const SEED: Array<[string, number]> = [
    ['gamma', 3],
    ['alpha', 9],
    ['beta', 7],
    ['delta', 3],
    ['epsilon', 9],
];

function seededRepository(): { repository: InMemoryRepository<PageThing, number>; dataSource: InMemoryDataSource } {
    const dataSource = new InMemoryDataSource();
    const entityManager = new InMemoryEntityManager(dataSource);
    const repository = new InMemoryRepository(PageThing, entityManager);

    for (const [name, score] of SEED) {
        const thing = new PageThing(name, score);
        entityManager.persist(thing);
    }

    return { repository, dataSource };
}

describe('pageFromAll', () => {
    const allowed = new Set(['name', 'score']);

    it('computes stable page math over the full result set', () => {
        const page = pageFromAll(
            SEED.map(([name, score]) => new PageThing(name, score)),
            { page: 2, size: 2 },
            allowed
        );

        expect(page.page).toBe(2);
        expect(page.size).toBe(2);
        expect(page.content.map((thing) => thing.name)).toEqual(['beta', 'delta']);
        expect(page.totalElements).toBe(5);
        expect(page.totalPages).toBe(3);
    });

    it('returns empty content for pages beyond the last', () => {
        const page = pageFromAll(
            SEED.map(([name, score]) => new PageThing(name, score)),
            { page: 9, size: 2 },
            allowed
        );

        expect(page.content).toEqual([]);
        expect(page.totalElements).toBe(5);
    });

    it('sorts asc/desc and defaults to ascending', () => {
        const items = SEED.map(([name, score]) => new PageThing(name, score));

        const byNameAsc = pageFromAll(items, { page: 1, size: 10, sort: [{ property: 'name' }] }, allowed);
        expect(byNameAsc.content.map((thing) => thing.name)).toEqual(['alpha', 'beta', 'delta', 'epsilon', 'gamma']);

        const byScoreDesc = pageFromAll(
            items,
            { page: 1, size: 10, sort: [{ property: 'score', direction: 'desc' }] },
            allowed
        );
        expect(byScoreDesc.content.map((thing) => thing.score)).toEqual([9, 9, 7, 3, 3]);
    });

    it('applies multi-key sorts in clause order', () => {
        const items = SEED.map(([name, score]) => new PageThing(name, score));

        const page = pageFromAll(
            items,
            { page: 1, size: 10, sort: [{ property: 'score' }, { property: 'name', direction: 'desc' }] },
            allowed
        );

        expect(page.content.map((thing) => thing.name)).toEqual(['gamma', 'delta', 'beta', 'epsilon', 'alpha']);
    });

    it('fails loud on unknown sort properties', () => {
        const items = SEED.map(([name, score]) => new PageThing(name, score));

        expect(() => pageFromAll(items, { page: 1, size: 1, sort: [{ property: 'nope' }] }, allowed)).toThrow(
            'unknown sort property "nope"'
        );
    });
});

describe('validatePageRequest', () => {
    it('rejects non-positive or non-integer pages and sizes', () => {
        const allowed = new Set(['name']);

        expect(() => validatePageRequest({ page: 0, size: 1 }, allowed)).toThrow('page must be a positive integer');
        expect(() => validatePageRequest({ page: 1, size: 0 }, allowed)).toThrow('size must be a positive integer');
        expect(() => validatePageRequest({ page: 1.5, size: 1 }, allowed)).toThrow('page must be a positive integer');
    });

    it('rejects illegal sort directions', () => {
        // Cast past the static type: validation exists for dynamic callers
        // (e.g. parsed query strings) that bypass the compiler.
        expect(() =>
            validatePageRequest(
                { page: 1, size: 1, sort: [{ property: 'name', direction: 'up' as SortDirection }] },
                new Set(['name'])
            )
        ).toThrow("sort direction must be 'asc' or 'desc'");
    });
});

describe('InMemoryRepository.findPage', () => {
    let repository: InMemoryRepository<PageThing, number>;

    beforeEach(() => {
        repository = seededRepository().repository;
    });

    it('pages over persisted entities with totals', () => {
        const page = repository.findPage({ page: 1, size: 3 });

        expect(page.content).toHaveLength(3);
        expect(page.totalElements).toBe(5);
        expect(page.totalPages).toBe(2);
    });

    it('enforces the entity column allowlist', () => {
        expect(() => repository.findPage({ page: 1, size: 2, sort: [{ property: 'missing' }] })).toThrow(
            'unknown sort property "missing"'
        );
    });
});
