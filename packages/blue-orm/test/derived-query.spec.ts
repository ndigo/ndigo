/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDataSource } from '../src/data-source';
import { InMemoryEntityManager } from '../src/entity-manager';
import { column, entity, generated, primaryColumn } from '../src/decorators';
import { InMemoryDerivedQueryRepository } from '../src/repository';
import { parseDerivedQuery } from '../src/derived-query-repository';
import { getEntityMetadata } from '../src/metadata';

@entity('derived_users')
class DerivedUser {
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

@entity('and_thing')
class AndThing {
    @column()
    bandAndLoop: string = '';
}

const COLUMNS = getEntityMetadata(DerivedUser).columns;
const AND_COLUMNS = getEntityMetadata(AndThing).columns;

describe('parseDerivedQuery', () => {
    it('parses equality filters with an OrderBy clause, defaulting to asc', () => {
        const query = parseDerivedQuery('findByScoreOrderByScore', COLUMNS);

        expect(query?.filters).toEqual([{ property: 'score', valueIndex: 0 }]);
        expect(query?.orderBy).toEqual([{ property: 'score', direction: 'asc' }]);
        expect(query?.limit).toBeUndefined();
    });

    it('parses explicit Asc and Desc directions', () => {
        expect(parseDerivedQuery('findByScoreOrderByScoreAsc', COLUMNS)?.orderBy).toEqual([
            { property: 'score', direction: 'asc' },
        ]);
        expect(parseDerivedQuery('findByNameOrderByNameDesc', COLUMNS)?.orderBy).toEqual([
            { property: 'name', direction: 'desc' },
        ]);
    });

    it('parses First and TopN limits', () => {
        const first = parseDerivedQuery('findByNameFirst', COLUMNS);
        expect(first?.filters).toEqual([{ property: 'name', valueIndex: 0 }]);
        expect(first?.limit).toBe(1);

        const top = parseDerivedQuery('findByScoreTop3', COLUMNS);
        expect(top?.limit).toBe(3);
    });

    it('parses conjunction chains of three or more properties', () => {
        const query = parseDerivedQuery('findByNameAndScoreAndName', COLUMNS);

        expect(query?.filters).toEqual([
            { property: 'name', valueIndex: 0 },
            { property: 'score', valueIndex: 1 },
            { property: 'name', valueIndex: 2 },
        ]);
    });

    it('falls back to a single property whose name contains And', () => {
        expect(parseDerivedQuery('findByBandAndLoop', AND_COLUMNS)?.filters).toEqual([
            { property: 'bandAndLoop', valueIndex: 0 },
        ]);
    });

    it('returns null for unsupported method names', () => {
        expect(parseDerivedQuery('findByScoreOrderByNope', COLUMNS)).toBeNull();
        expect(parseDerivedQuery('notADerivedQuery', COLUMNS)).toBeNull();
        expect(parseDerivedQuery('findByScoreTop0', COLUMNS)).toBeNull();
        expect(parseDerivedQuery('findBy', COLUMNS)).toBeNull();
    });
});

class UserRepository extends InMemoryDerivedQueryRepository<DerivedUser, number> {}

describe('InMemoryDerivedQueryRepository derived queries', () => {
    let repository: UserRepository;

    beforeEach(() => {
        const dataSource = new InMemoryDataSource();
        const entityManager = new InMemoryEntityManager(dataSource);
        repository = new UserRepository(DerivedUser, entityManager);

        for (const [name, score] of [
            ['alpha', 9],
            ['beta', 3],
            ['gamma', 3],
            ['delta', 7],
        ] as Array<[string, number]>) {
            const user = new DerivedUser(name, score);
            entityManager.persist(user);
        }
    });

    it('applies ordering to filter results', () => {
        expect(repository.derive('findByScoreOrderByNameDesc', [3]).map((user) => user.name)).toEqual([
            'gamma',
            'beta',
        ]);
    });

    it('limits results with TopN and First', () => {
        expect(repository.derive('findByScoreTop2', [9]).map((user) => user.name)).toEqual(['alpha']);
        expect(repository.derive('findByScoreTop1', [3]).map((user) => user.name)).toEqual(['beta']);
        expect(repository.derive('findByNameFirst', ['beta']).map((user) => user.name)).toEqual(['beta']);
    });

    it('still rejects unsupported method names', () => {
        expect(() => repository.derive('findByNope', ['x'])).toThrow(TypeError);
    });
});
