/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { IllegalStateError, type JSONObject } from '@ndigo/core';
import { wrapSource } from '../src/property-source';
import type { PropertySource } from '../src/property-source';
import { MutablePropertySources } from '../src/property-sources';

describe('wrapSource', () => {
    test('it should capture the source under the given name', () => {
        const source = wrapSource('systemEnvironment', { a: 1, nested: { b: 2 } });

        expect(source.name).toBe('systemEnvironment');
        expect(source.properties).toEqual({ a: 1, nested: { b: 2 } });
    });

    test('it should copy the source instead of holding the caller object live', () => {
        const original = { a: 1 };
        const source = wrapSource('user', original);

        original.a = 2;

        expect(source.properties.a).toBe(1);
    });

    test('it should resolve getProperty by keypath and bracket syntax', () => {
        const source = wrapSource('user', { a: 1, items: [{ title: 'x' }], j: { k: 10 } });

        expect(source.getProperty('a')).toBe(1);
        expect(source.getProperty('j.k')).toBe(10);
        expect(source.getProperty('items[0].title')).toBe('x');
        expect(source.getProperty('missing')).toBeUndefined();
        expect(source.getProperty('j..k')).toBeUndefined();
    });

    test('it should report containsProperty only for non-null values', () => {
        const source = wrapSource('user', { a: 1, b: null });

        expect(source.containsProperty('a')).toBe(true);
        expect(source.containsProperty('b')).toBe(false);
        expect(source.containsProperty('missing')).toBe(false);
    });

    test('it should not pollute the prototype when a source has __proto__ keys', () => {
        // JSON.parse yields an OWN data property named __proto__ (unlike a literal).
        const parsed = JSON.parse('{"__proto__": {"polluted": true}, "a": 1}') as JSONObject;
        const source = wrapSource('user', parsed);

        expect(Object.getPrototypeOf(source.properties)).toBeNull();
        expect((source.properties as Record<string, unknown>)['__proto__']).toEqual({ polluted: true });
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
});

describe('MutablePropertySources', () => {
    const sources = () => new MutablePropertySources();

    test('it should add sources in insertion order', () => {
        const registry = sources();

        registry.addLast('a', { a: 1 }).addLast('b', { b: 2 }).addFirst('z', { z: 26 });

        expect(registry.size).toBe(3);
        expect([...registry].map((s) => s.name)).toEqual(['z', 'a', 'b']);
        expect(registry.toArray().map((s) => s.name)).toEqual(['z', 'a', 'b']);
    });

    test('it should resolve get and contains by name', () => {
        const registry = sources();

        registry.addLast('a', { a: 1 });

        expect(registry.get('a')?.getProperty('a')).toBe(1);
        expect(registry.get('missing')).toBeUndefined();
        expect(registry.contains('a')).toBe(true);
        expect(registry.contains('missing')).toBe(false);
    });

    test('it should support addBefore and addAfter relative to an anchor', () => {
        const registry = sources();

        registry.addLast('b', {}).addLast('d', {});
        registry.addBefore('b', 'a', {});
        registry.addAfter('d', 'e', {});
        registry.addAfter('b', 'c', {});

        expect(registry.toArray().map((s) => s.name)).toEqual(['a', 'b', 'c', 'd', 'e']);
    });

    test('unknown anchors should reject insertion without changing sources', () => {
        const registry = sources();

        registry.addLast('b', {});

        expect(() => registry.addBefore('nope', 'a', {})).toThrow(IllegalStateError);
        expect(() => registry.addAfter('nope', 'a', {})).toThrow(IllegalStateError);
        expect([...registry].map((source) => source.name)).toEqual(['b']);
    });

    test('addFirst and addLast should reposition an existing name', () => {
        const registry = sources();

        registry.addLast('a', { a: 1 }).addLast('b', { b: 2 }).addLast('c', { c: 3 });
        registry.addFirst('c', { c: 30 });

        expect(registry.toArray().map((s) => s.name)).toEqual(['c', 'a', 'b']);

        registry.addLast('a', { a: 10 });

        expect(registry.toArray().map((s) => s.name)).toEqual(['c', 'b', 'a']);
        expect(registry.get('a')?.getProperty('a')).toBe(10);
    });

    test('a self-anchor should replace the source in place', () => {
        const registry = sources();

        registry.addLast('a', { a: 1 }).addLast('b', { b: 2 });
        registry.addBefore('a', 'a', { a: 9 });

        expect(registry.toArray().map((s) => s.name)).toEqual(['a', 'b']);
        expect(registry.get('a')?.getProperty('a')).toBe(9);
    });

    test('remove should delete only the named source and preserve relative order', () => {
        const registry = sources();

        registry.addLast('a', { a: 1 }).addLast('b', { b: 2 }).addLast('c', { c: 3 });

        expect(registry.remove('b')).toBe(true);
        expect(registry.remove('b')).toBe(false);
        expect(registry.toArray().map((s) => s.name)).toEqual(['a', 'c']);
    });

    test('replace should keep the position and swap the source', () => {
        const registry = sources();

        registry.addLast('a', { a: 1 }).addLast('b', { b: 2 }).addLast('c', { c: 3 });

        expect(registry.replace('b', { b: 20 })).toBe(true);
        expect(registry.replace('missing', {})).toBe(false);
        expect(registry.toArray().map((s) => s.name)).toEqual(['a', 'b', 'c']);
        expect(registry.get('b')?.getProperty('b')).toBe(20);
    });

    test('keyed enumeration should track precedence changes, replacement and removal', () => {
        const registry = sources().addLast('a', { value: 1 }).addLast('b', { value: 2 }).addLast('c', { value: 3 });
        const assertOrder = (names: string[]) => {
            expect([...registry.keys()]).toEqual(names);
            expect([...registry.entries()]).toEqual(names.map((name) => [name, registry.get(name)]));
            expect([...registry.values()]).toEqual(names.map((name) => registry.get(name)));
            expect([...registry]).toEqual([...registry.values()]);
        };

        registry.toArray();
        assertOrder(['a', 'b', 'c']);
        registry.addFirst('c', { value: 30 });
        assertOrder(['c', 'a', 'b']);
        registry.addLast('a', { value: 10 });
        assertOrder(['c', 'b', 'a']);
        registry.addBefore('c', 'a', { value: 11 });
        assertOrder(['a', 'c', 'b']);
        registry.addAfter('b', 'c', { value: 31 });
        assertOrder(['a', 'b', 'c']);

        const previous = registry.get('b');
        registry.replace('b', { value: 20 });
        assertOrder(['a', 'b', 'c']);
        expect([...registry.values()][1]).not.toBe(previous);
        expect([...registry.values()][1].getProperty('value')).toBe(20);

        registry.remove('b');
        assertOrder(['a', 'c']);
    });

    test('forEach should visit current sources in precedence order with context and collection identity', () => {
        const registry = sources().addLast('a', {}).addFirst('b', {});
        registry.toArray();
        registry.replace('b', { value: 2 });
        const context = { names: [] as string[], values: [] as PropertySource[] };
        const version = registry.version;

        registry.forEach(function (this: typeof context, value, key, collection) {
            expect(this).toBe(context);
            expect(collection).toBe(registry);
            expect(value).toBe(registry.get(key));
            this.names.push(key);
            this.values.push(value);
        }, context);

        expect(context.names).toEqual(['b', 'a']);
        expect(context.values).toEqual([...registry.values()]);
        expect(registry.version).toBe(version);
    });

    test('every mutation should bump the version; reads should not', () => {
        const registry = sources();

        const initial = registry.version;
        registry.addLast('a', { a: 1 });
        registry.addLast('a', { a: 2 });

        expect(registry.version).toBeGreaterThan(initial);
        const afterMutations = registry.version;

        // Read paths must keep working after mutations — assert, not just call.
        expect(() => registry.get('a')).not.toThrow();
        expect(() => registry.contains('a')).not.toThrow();
        expect(() => registry.toArray()).not.toThrow();
        expect(() => [...registry.entries()]).not.toThrow();
        expect(() => [...registry.keys()]).not.toThrow();
        expect(() => [...registry.values()]).not.toThrow();
        expect(() => registry.forEach(() => {})).not.toThrow();

        expect(registry.version).toBe(afterMutations);

        registry.remove('a');
        registry.addLast('x', {});
        registry.addBefore('x', 'y', {});

        expect(registry.version).toBeGreaterThan(afterMutations);
    });
});
