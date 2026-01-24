import { describe, test, expect } from 'vitest';
import { ParamsRouteCondition, PatternsRouteCondition } from '../src/route-mapping-info';

describe('ParamsRouteCondition', () => {
    test('it should be equatable', () => {
        const foo = new ParamsRouteCondition('foo'),
            fooBar = new ParamsRouteCondition('foo=bar');

        expect(foo.equals(foo)).toBe(true);
        expect(foo.equals(new ParamsRouteCondition('foo'))).toBe(true);
        expect(foo.equals(new ParamsRouteCondition('bar'))).toBe(false);
        expect(foo.equals(new ParamsRouteCondition('FOO'))).toBe(false);
        expect(fooBar.equals(fooBar)).toBe(true);
        expect(fooBar.equals(new ParamsRouteCondition('foo=bar'))).toBe(true);
        expect(fooBar.equals(new ParamsRouteCondition('FOO=bar'))).toBe(false);
    });

    test('it should match parameter names', () => {
        const route = { path: '/', data: { foo: '', bar: null } },
            foo = new ParamsRouteCondition('foo'),
            bar = new ParamsRouteCondition('bar'),
            baz = new ParamsRouteCondition('baz'),
            matchingFoo = foo.getMatchingCondition(route),
            matchingBar = bar.getMatchingCondition(route),
            matchingBaz = baz.getMatchingCondition(route);

        expect(matchingFoo).not.toBeNull();
        expect(matchingBar).not.toBeNull();
        expect(matchingBaz).toBeNull();
    });

    test('it should match negated parameter names', () => {
        const route = { path: '/' },
            notFoo = new ParamsRouteCondition('!foo'),
            matchingNotFoo = notFoo.getMatchingCondition(route);

        expect(matchingNotFoo).not.toBeNull();
    });

    test('it should match parameter values', () => {
        const route = { path: '/', data: { foo: 'bar', baz: 'qux' } },
            fooBar = new ParamsRouteCondition('foo=bar'),
            bazBar = new ParamsRouteCondition('baz=bar'),
            matchingFooBar = fooBar.getMatchingCondition(route),
            matchingBazBar = bazBar.getMatchingCondition(route);

        expect(matchingFooBar).not.toBeNull();
        expect(matchingBazBar).toBeNull();
    });

    test('it should be comparable', () => {
        const cond1 = new ParamsRouteCondition('foo', 'bar', 'baz'),
            cond2 = new ParamsRouteCondition('foo=123', 'bar');

        expect(cond1.compareTo(cond2)).toBeLessThan(0);
        expect(cond2.compareTo(cond1)).toBeGreaterThan(0);
    });

    test('it should be comparable w/ values', () => {
        const cond1 = new ParamsRouteCondition('foo=123'),
            cond2 = new ParamsRouteCondition('foo');

        expect(cond1.compareTo(cond2)).toBeLessThan(0);
    });

    test('it should be comparable w/ negated values', () => {
        const cond1 = new ParamsRouteCondition('foo!=123'),
            cond2 = new ParamsRouteCondition('foo');

        expect(cond1.compareTo(cond2)).toBe(0);
    });

    test('it should be combinable', () => {
        const cond1 = new ParamsRouteCondition('foo=bar'),
            cond2 = new ParamsRouteCondition('foo=baz'),
            combined = cond1.merge(cond2),
            content = combined.content;

        expect(content.length).toBe(2);
    });
});

describe('PatternsRouteCondition', () => {
    test('it should prepend slashes', () => {
        const foo = new PatternsRouteCondition('foo');
        expect(foo.patterns.values().next().value).toBe('/foo');
    });

    test('it should not prepend slashes to empty patterns', () => {
        const empty = new PatternsRouteCondition('');
        expect(empty.patterns.values().next().value).toBe('');
    });

    test('it should merge empty sets', () => {
        const cond1 = new PatternsRouteCondition(),
            cond2 = new PatternsRouteCondition(),
            empty = new PatternsRouteCondition('');

        expect(cond1.merge(cond2).equals(empty)).toBe(true);
    });

    test('it should merge one pattern w/ empty set', () => {
        const cond1 = new PatternsRouteCondition('/type1', '/type2'),
            cond2 = new PatternsRouteCondition();

        expect(cond1.merge(cond2).equals(new PatternsRouteCondition('/type1', '/type2'))).toBe(true);
    });

    test('it should merge multiple patterns', () => {
        const cond1 = new PatternsRouteCondition('/t1', '/t2'),
            cond2 = new PatternsRouteCondition('/m1', '/m2');

        expect(cond1.merge(cond2).equals(new PatternsRouteCondition('/t1/m1', '/t1/m2', '/t2/m1', '/t2/m2'))).toBe(
            true
        );
    });

    test('it should match direct path', () => {
        const cond = new PatternsRouteCondition('/foo'),
            match = cond.getMatchingCondition({ path: '/foo' });

        expect(match).not.toBeNull();
    });

    test('it should match patterns', () => {
        const cond = new PatternsRouteCondition('/foo/*'),
            match = cond.getMatchingCondition({ path: '/foo/bar' });

        expect(match).not.toBeNull();
    });
});
