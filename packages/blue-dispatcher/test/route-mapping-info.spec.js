import { ParamsRouteCondition, PatternsRouteCondition } from '../src/route-mapping-info';

const { expect } = require('chai');

describe('ParamsRouteCondition', function () {
    test('it should be equatable', function () {
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

    test('it should match parameter names', function () {
        const route = { path: '/', data: { foo: '', bar: null } },
            foo = new ParamsRouteCondition('foo'),
            bar = new ParamsRouteCondition('bar'),
            baz = new ParamsRouteCondition('baz'),
            matchingFoo = foo.getMatchingCondition(route),
            matchingBar = bar.getMatchingCondition(route),
            matchingBaz = baz.getMatchingCondition(route);

        expect(matchingFoo).is.not.null;
        expect(matchingBar).is.not.null;
        expect(matchingBaz).is.null;
    });

    test('it should match negated parameter names', function () {
        const route = { path: '/' },
            notFoo = new ParamsRouteCondition('!foo'),
            matchingNotFoo = notFoo.getMatchingCondition(route);

        expect(matchingNotFoo).is.not.null;
    });

    test('it should match parameter values', function () {
        const route = { path: '/', data: { foo: 'bar', baz: 'qux' } },
            fooBar = new ParamsRouteCondition('foo=bar'),
            bazBar = new ParamsRouteCondition('baz=bar'),
            matchingFooBar = fooBar.getMatchingCondition(route),
            matchingBazBar = bazBar.getMatchingCondition(route);

        expect(matchingFooBar).is.not.null;
        expect(matchingBazBar).is.null;
    });

    test('it should be comparable', function () {
        const cond1 = new ParamsRouteCondition('foo', 'bar', 'baz'),
            cond2 = new ParamsRouteCondition('foo=123', 'bar');

        expect(cond1.compareTo(cond2)).to.be.lessThan(0);
        expect(cond2.compareTo(cond1)).toBeGreaterThan(0);
    });

    test('it should be comparable w/ values', function () {
        const cond1 = new ParamsRouteCondition('foo=123'),
            cond2 = new ParamsRouteCondition('foo');

        expect(cond1.compareTo(cond2)).to.be.lessThan(0);
    });

    test('it should be comparable w/ negated values', function () {
        const cond1 = new ParamsRouteCondition('foo!=123'),
            cond2 = new ParamsRouteCondition('foo');

        expect(cond1.compareTo(cond2)).toBe(0);
    });

    test('it should be combinable', function () {
        const cond1 = new ParamsRouteCondition('foo=bar'),
            cond2 = new ParamsRouteCondition('foo=baz'),
            combined = cond1.merge(cond2),
            content = combined.content;

        expect(content.length).toBe(2);
    });
});

describe('PatternsRouteCondition', function () {
    test('it should prepend slashes', function () {
        const foo = new PatternsRouteCondition('foo');
        expect(foo.patterns.values().next().value).toBe('/foo');
    });

    test('it should not prepend slashes to empty patterns', function () {
        const empty = new PatternsRouteCondition('');
        expect(empty.patterns.values().next().value).toBe('');
    });

    test('it should merge empty sets', function () {
        const cond1 = new PatternsRouteCondition(),
            cond2 = new PatternsRouteCondition(),
            empty = new PatternsRouteCondition('');

        expect(cond1.merge(cond2).equals(empty)).toBe(true);
    });

    test('it should merge one pattern w/ empty set', function () {
        const cond1 = new PatternsRouteCondition('/type1', '/type2'),
            cond2 = new PatternsRouteCondition();

        expect(cond1.merge(cond2).equals(new PatternsRouteCondition('/type1', '/type2'))).toBe(true);
    });

    test('it should merge multiple patterns', function () {
        const cond1 = new PatternsRouteCondition('/t1', '/t2'),
            cond2 = new PatternsRouteCondition('/m1', '/m2');

        expect(cond1.merge(cond2).equals(new PatternsRouteCondition('/t1/m1', '/t1/m2', '/t2/m1', '/t2/m2'))).toBe(
            true
        );
    });

    test('it should match direct path', function () {
        const cond = new PatternsRouteCondition('/foo'),
            match = cond.getMatchingCondition({ path: '/foo' });

        expect(match).is.not.null;
    });

    test('it should match patterns', function () {
        const cond = new PatternsRouteCondition('/foo/*'),
            match = cond.getMatchingCondition({ path: '/foo/bar' });

        expect(match).is.not.null;
    });
});
