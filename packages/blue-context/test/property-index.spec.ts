/**
 * @module blue-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { MutablePropertySources } from '../src/property-sources';
import { FlatMergedIndex, PrototypeChainIndex, PrototypalPropertyResolver } from '../src/property-resolver';
import { wrapSource } from '../src/property-source';

const SNAKE = 'flat|prototype';

describe('PropertyIndex parity', () => {
    const fixtures: Array<{ name: string; sources: Array<[string, Record<string, unknown>]>; queries: string[] }> = [
        {
            name: 'flat config',
            sources: [
                ['a', { a: 1, b: 2 }],
                ['b', { b: 20, c: 3 }],
            ],
            queries: ['a', 'b', 'c', 'missing', 'a.b', 'b.c'],
        },
        {
            name: 'nested merge',
            sources: [
                ['a', { server: { port: 8080, host: 'x' } }],
                ['b', { server: { host: 'y', debug: true }, db: { url: 'z' } }],
            ],
            queries: ['server.port', 'server.host', 'server.debug', 'db.url', 'server.missing'],
        },
        {
            name: '32-source overlap',
            sources: Array.from({ length: 32 }, (_, i) => [`s${i}`, { key: i, shared: i, nested: { v: i } }]),
            queries: ['key', 'shared', 'nested.v', 'missing.any'],
        },
        {
            name: 'null values and arrays',
            sources: [
                ['a', { nul: null, list: [1, 2, 3] }],
                ['b', { nul: 'not-null' }],
            ],
            queries: ['nul', 'list[0]', 'list[2]', 'list[5]'],
        },
    ];

    for (const fixture of fixtures) {
        const sources = fixture.sources.map(([name, values]) => wrapSource(name, values));

        for (const query of fixture.queries) {
            test(`${fixture.name} — "${query}" returns the same value on both indexes (${SNAKE})`, () => {
                const prototype = new PrototypeChainIndex();
                const flat = new FlatMergedIndex();
                prototype.build(sources);
                flat.build(sources);

                expect(flat.getProperty(query)).toEqual(prototype.getProperty(query));
                expect(flat.hasProperty(query)).toBe(prototype.hasProperty(query));
            });
        }
    }

    test('getRequiredProperty should throw on missing in both strategies', () => {
        const registry = new MutablePropertySources();
        registry.addLast('a', { a: 1 });

        const prototype = PrototypalPropertyResolver.create(registry, { index: 'prototype' });
        const flat = PrototypalPropertyResolver.create(new MutablePropertySources().addLast('a', { a: 1 }), {
            index: 'flat',
        });

        expect(() => prototype.getRequiredProperty('missing')).toThrowError('Required property "missing" missing');
        expect(() => flat.getRequiredProperty('missing')).toThrowError('Required property "missing" missing');
    });
});

describe('FlatMergedIndex origin + rebuild semantics', () => {
    test('origin records the first source that defined each top-level key', () => {
        const flat = new FlatMergedIndex();
        flat.build([wrapSource('first', { a: 1, shared: 1 }), wrapSource('second', { shared: 2, b: 3 })]);

        expect(flat.originOf('a')).toBe('first');
        expect(flat.originOf('shared')).toBe('first');
        expect(flat.originOf('b')).toBe('second');
        expect(flat.originOf('missing')).toBeUndefined();
    });

    test('rebuild after registry replace repoints origins and values', () => {
        const flat = new FlatMergedIndex();
        flat.build([wrapSource('first', { a: 1 }), wrapSource('second', { b: 2 })]);

        flat.build([wrapSource('new', { a: 9 })]);

        expect(flat.getProperty('a')).toBe(9);
        expect(flat.getProperty('b')).toBeUndefined();
        expect(flat.originOf('a')).toBe('new');
    });

    test('registry-driven resolver picks up mutations lazily', () => {
        const registry = new MutablePropertySources();
        registry.addLast('a', { a: 1 });
        const resolver = PrototypalPropertyResolver.create(registry);

        expect(resolver.getProperty('a')).toBe(1);
        expect(resolver.getProperty('b')).toBeUndefined();

        registry.addLast('b', { b: 2 });

        expect(resolver.getProperty('b')).toBe(2);

        registry.replace('a', { a: 10 });

        expect(resolver.getProperty('a')).toBe(10);
    });
});

describe('index selection', () => {
    test('both strategies resolve identically through the resolver (selection is behavior-neutral)', () => {
        const registry = new MutablePropertySources().addLast('test', { a: 1, nested: { b: 2 } });
        const flat = PrototypalPropertyResolver.create(registry, { index: 'flat' });
        const prototype = PrototypalPropertyResolver.create(
            new MutablePropertySources().addLast('test', { a: 1, nested: { b: 2 } })
        );

        expect(flat.getProperty('a')).toBe(prototype.getProperty('a'));
        expect(flat.getProperty('nested.b')).toBe(prototype.getProperty('nested.b'));
        expect(flat.hasProperty('nested.b')).toBe(prototype.hasProperty('nested.b'));
    });
});
