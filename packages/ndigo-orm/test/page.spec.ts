/**
 */
import '@tsmetadata/polyfill';

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { column, entity as entityDecorator, generatedColumn, primaryColumn } from '../src/decorators';
import { InMemoryEntityManager } from '../src/entity-manager';

// Spec-side type wrapper; runtime-identical to the production `entity` decorator.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;
import { InMemoryRepository } from '../src/repository';
import { pageFromAll, sortComparator, validatePageRequest, SortDirection } from '../src/page';

@entity('page_things')
class PageThing {
    @generatedColumn()
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

describe('sortComparator', () => {
    // Characterization specs: pin the pre-refactor ordering exactly so the
    // combinator rewrite is provably behavior-preserving.
    it('puts null first ascending and last descending', () => {
        const items = [{ v: 3 }, { v: null }, { v: 1 }, { v: 2 }];

        const asc = sortComparator<{ v: number | null }>([{ property: 'v' }]);
        expect([...items].sort(asc).map((item) => item.v)).toEqual([null, 1, 2, 3]);

        const desc = sortComparator<{ v: number | null }>([{ property: 'v', direction: 'desc' }]);
        expect([...items].sort(desc).map((item) => item.v)).toEqual([3, 2, 1, null]);
    });

    it('treats undefined like null against a value', () => {
        const items = [{ v: 3 }, { v: undefined }, { v: 1 }, { v: 2 }];

        const asc = sortComparator<{ v: number | undefined }>([{ property: 'v' }]);
        expect([...items].sort(asc).map((item) => item.v)).toEqual([undefined, 1, 2, 3]);

        const desc = sortComparator<{ v: number | undefined }>([{ property: 'v', direction: 'desc' }]);
        expect([...items].sort(desc).map((item) => item.v)).toEqual([3, 2, 1, undefined]);
    });

    it('pins the existing null-vs-undefined comparison: both directions report left-first', () => {
        // Not a strict weak ordering — preserved deliberately. The refactor
        // must keep the pair-wise result identical, quirk included.
        const asc = sortComparator<{ v: unknown }>([{ property: 'v' }]);
        expect(asc({ v: null }, { v: undefined })).toBe(-1);
        expect(asc({ v: undefined }, { v: null })).toBe(-1);

        const desc = sortComparator<{ v: unknown }>([{ property: 'v', direction: 'desc' }]);
        expect(desc({ v: null }, { v: undefined })).toBe(1);
        expect(desc({ v: undefined }, { v: null })).toBe(1);
    });

    it('compares mixed-type and NaN columns as equal', () => {
        const asc = sortComparator<{ v: unknown }>([{ property: 'v' }]);

        expect(asc({ v: 'b' }, { v: 1 })).toBe(0);
        expect(asc({ v: 1 }, { v: 'b' })).toBe(0);
        expect(asc({ v: Number.NaN }, { v: 1 })).toBe(0);
        expect(asc({ v: Number.NaN }, { v: Number.NaN })).toBe(0);
    });

    it('applies clauses in order, returning zero for ties and empty sorts', () => {
        const cmp = sortComparator<{ a: number; b: string }>([{ property: 'a' }, { property: 'b', direction: 'desc' }]);

        expect(cmp({ a: 1, b: 'x' }, { a: 2, b: 'a' })).toBeLessThan(0);
        expect(cmp({ a: 1, b: 'x' }, { a: 1, b: 'y' })).toBeGreaterThan(0);
        expect(cmp({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(0);
        expect(sortComparator<{ a: number }>([])({ a: 1 }, { a: 2 })).toBe(0);
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
