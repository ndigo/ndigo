/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { entity as entityDecorator, generatedColumn, primaryColumn, column } from '@ndigo/orm';

// Spec-side type wrapper; runtime-identical to the production `entity` decorator.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;
import { DrizzleDataSource } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { DrizzleDerivedQueryRepository } from '../src/drizzle-derived-query-repository';

@entity('derived_notes')
class DerivedNote {
    @generatedColumn()
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

class NoteDerivedRepository extends DrizzleDerivedQueryRepository<DerivedNote, number> {}

function seededRepository(): Promise<NoteDerivedRepository> {
    const dataSource = new DrizzleDataSource({ url: ':memory:' });
    return dataSource.init([DerivedNote]).then(() => {
        const repository = new NoteDerivedRepository(DerivedNote, new DrizzleEntityManager(dataSource));
        return Promise.all(
            [
                ['first', 1],
                ['second', 2],
                ['third', 2],
                ['fourth', 3],
            ].map(([title, priority]) => repository.save(new DerivedNote(title as string, priority as number)))
        ).then(() => repository);
    });
}

describe('DrizzleDerivedQueryRepository', () => {
    test('evaluates equality filters to parameterized SQL', async () => {
        const repository = await seededRepository();

        const results = await repository.derive('findByPriority', [2]);
        expect(results.map((note) => note.title).sort()).toEqual(['second', 'third']);
    });

    test('applies ordering and direction', async () => {
        const repository = await seededRepository();

        const ascending = await repository.derive('findByPriorityOrderByTitle', [2]);
        expect(ascending.map((note) => note.title)).toEqual(['second', 'third']);

        const descending = await repository.derive('findByPriorityOrderByTitleDesc', [2]);
        expect(descending.map((note) => note.title)).toEqual(['third', 'second']);
    });

    test('limits results with TopN', async () => {
        const repository = await seededRepository();

        const top = await repository.derive('findByPriorityTop2', [2]);
        expect(top.map((note) => note.title)).toEqual(['second', 'third']);

        const first = await repository.derive('findByPriorityFirst', [2]);
        expect(first.map((note) => note.title)).toEqual(['second']);
    });

    test('evaluates the documented Top-N example and rejects the `findTopNBy…` prefix form', async () => {
        const repository = await seededRepository();

        // DA-4: the class docs document the trailing-suffix grammar.
        const documented = await repository.derive('findByPriorityTop3', [2]);
        expect(documented.map((note) => note.title)).toEqual(['second', 'third']);

        // The `findTopNBy…` prefix form the docs used to show is not implemented.
        await expect(repository.derive('findTop3ByPriority', [2])).rejects.toThrow('unsupported derived query');
    });

    test('rejects unsupported method names', async () => {
        const repository = await seededRepository();

        await expect(repository.derive('findByNope', ['x'])).rejects.toThrow('unsupported derived query');
    });
});
