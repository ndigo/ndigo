import { describe, test, expect } from 'vitest';
import {
    QueryParamCondition,
    PatternsRouteCondition,
    RouteMappingInfo,
    QueryParamExpression,
    MatrixParamExpression,
    MatrixParamCondition,
} from '../src/route-mapping-info';
import { Route } from '@blue/router';

const createRoute = (path: string, data?: Record<string, string | null>): Route =>
    ({
        attributes: {},
        data: data ?? {},
        id: 0,
        length: path.length,
        params: {},
        path,
        raw: path,
    }) as unknown as Route;

const createRouteWithSegments = (path: string, segments: Array<{ data: Record<string, string> }>): Route => {
    const route: unknown = {
        attributes: {},
        data: {},
        id: 0,
        length: segments.length,
        params: {},
        path,
        raw: path,
    };
    segments.forEach((seg, i) => {
        route[i] = seg;
    });
    return route as unknown as Route;
};

describe('QueryParamCondition', () => {
    test('it should be equatable', () => {
        const foo = new QueryParamCondition('foo'),
            fooBar = new QueryParamCondition('foo=bar');

        expect(foo.equals(foo)).toBe(true);
        expect(foo.equals(new QueryParamCondition('foo'))).toBe(true);
        expect(foo.equals(new QueryParamCondition('bar'))).toBe(false);
        expect(foo.equals(new QueryParamCondition('FOO'))).toBe(false);
        expect(fooBar.equals(fooBar)).toBe(true);
        expect(fooBar.equals(new QueryParamCondition('foo=bar'))).toBe(true);
        expect(fooBar.equals(new QueryParamCondition('FOO=bar'))).toBe(false);
    });

    test('it should match parameter names', () => {
        const route = createRoute('/', { foo: '', bar: null }),
            foo = new QueryParamCondition('foo'),
            bar = new QueryParamCondition('bar'),
            baz = new QueryParamCondition('baz'),
            matchingFoo = foo.getMatchingCondition(route),
            matchingBar = bar.getMatchingCondition(route),
            matchingBaz = baz.getMatchingCondition(route);

        expect(matchingFoo).not.toBeNull();
        expect(matchingBar).not.toBeNull();
        expect(matchingBaz).toBeNull();
    });

    test('it should match negated parameter names', () => {
        const route = createRoute('/'),
            notFoo = new QueryParamCondition('!foo'),
            matchingNotFoo = notFoo.getMatchingCondition(route);

        expect(matchingNotFoo).not.toBeNull();
    });

    test('it should match parameter values', () => {
        const route = createRoute('/', { foo: 'bar', baz: 'qux' }),
            fooBar = new QueryParamCondition('foo=bar'),
            bazBar = new QueryParamCondition('baz=bar'),
            matchingFooBar = fooBar.getMatchingCondition(route),
            matchingBazBar = bazBar.getMatchingCondition(route);

        expect(matchingFooBar).not.toBeNull();
        expect(matchingBazBar).toBeNull();
    });

    test('it should be comparable', () => {
        const cond1 = new QueryParamCondition('foo', 'bar', 'baz'),
            cond2 = new QueryParamCondition('foo=123', 'bar');

        expect(cond1.compareTo(cond2)).toBeLessThan(0);
        expect(cond2.compareTo(cond1)).toBeGreaterThan(0);
    });

    test('it should be comparable w/ values', () => {
        const cond1 = new QueryParamCondition('foo=123'),
            cond2 = new QueryParamCondition('foo');

        expect(cond1.compareTo(cond2)).toBeLessThan(0);
    });

    test('it should be comparable w/ negated values', () => {
        const cond1 = new QueryParamCondition('foo!=123'),
            cond2 = new QueryParamCondition('foo');

        expect(cond1.compareTo(cond2)).toBe(0);
    });

    test('it should be combinable', () => {
        const cond1 = new QueryParamCondition('foo=bar'),
            cond2 = new QueryParamCondition('foo=baz'),
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

    test('it should store root pattern as "/"', () => {
        const root = new PatternsRouteCondition('/');
        expect(root.patterns.values().next().value).toBe('/');
    });

    test('it should merge empty sets', () => {
        const cond1 = new PatternsRouteCondition(new Set<string>()),
            cond2 = new PatternsRouteCondition(new Set<string>()),
            merged = cond1.merge(cond2);

        expect(merged.patterns.has('/')).toBe(true);
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
            match = cond.getMatchingCondition(createRoute('/foo'));

        expect(match).not.toBeNull();
    });

    test('it should match patterns', () => {
        const cond = new PatternsRouteCondition('/foo/*'),
            match = cond.getMatchingCondition(createRoute('/foo/bar'));

        expect(match).not.toBeNull();
    });

    test('it should match root pattern to empty path', () => {
        const cond = new PatternsRouteCondition('/'),
            match = cond.getMatchingCondition(createRoute(''));

        expect(match).not.toBeNull();
    });

    test('it should not match root pattern to non-empty path', () => {
        const cond = new PatternsRouteCondition('/'),
            match = cond.getMatchingCondition(createRoute('/foo'));

        expect(match).toBeNull();
    });

    test('it should include root in matching patterns for empty path', () => {
        const cond = new PatternsRouteCondition('/'),
            matches = cond.getMatchingPatterns('');

        expect(matches).toContain('/');
    });

    test('it should match merged root patterns to empty path', () => {
        const cond1 = new PatternsRouteCondition('/'),
            cond2 = new PatternsRouteCondition('/'),
            merged = cond1.merge(cond2),
            match = merged.getMatchingCondition(createRoute(''));

        expect(match).not.toBeNull();
    });

    test('it should merge root with path', () => {
        const cond1 = new PatternsRouteCondition('/'),
            cond2 = new PatternsRouteCondition('/foo'),
            merged = cond1.merge(cond2);

        expect(merged.patterns.has('/foo')).toBe(true);
    });

    test('it should merge path with root', () => {
        const cond1 = new PatternsRouteCondition('/foo'),
            cond2 = new PatternsRouteCondition('/'),
            merged = cond1.merge(cond2);

        expect(merged.patterns.has('/foo')).toBe(true);
    });

    test('it should return this when all patterns match', () => {
        const cond = new PatternsRouteCondition('/foo');
        const match = cond.getMatchingCondition(createRoute('/foo'));
        expect(match).toStrictEqual(cond);
    });
});

describe('RouteMappingInfo', () => {
    test('it should return this when all sub-conditions are satisfied', () => {
        const info = new RouteMappingInfo('/foo', new PatternsRouteCondition('/foo'));
        const match = info.getMatchingCondition(createRoute('/foo'));
        expect(match).toStrictEqual(info);
    });

    test('merge propagates matrix conditions from both sides', () => {
        const info1 = new RouteMappingInfo(
            null,
            new PatternsRouteCondition('/a'),
            new QueryParamCondition(),
            new MatrixParamCondition('color')
        );
        const info2 = new RouteMappingInfo(
            null,
            new PatternsRouteCondition('/b'),
            new QueryParamCondition(),
            new MatrixParamCondition('size')
        );
        const merged = info1.merge(info2);
        expect(merged.matrixCondition.expressions.size).toBe(2);
    });

    test('getMatchingCondition returns null when matrix condition fails', () => {
        const info = new RouteMappingInfo(
            null,
            new PatternsRouteCondition('/foo'),
            new QueryParamCondition(),
            new MatrixParamCondition('color')
        );
        // No segments — matrix condition cannot match
        const route = createRouteWithSegments('/foo', []);
        expect(info.getMatchingCondition(route)).toBeNull();
    });
});

describe('QueryParamExpression', () => {
    test('matchName returns true when query param name exists', () => {
        const route = createRoute('/', { foo: 'bar' });
        const expression = new QueryParamExpression('foo');
        expect(expression.matchName(route)).toBe(true);
    });

    test('matchName returns false when query param is absent', () => {
        const expression = new QueryParamExpression('baz');
        expect(expression.matchName(createRoute('/'))).toBe(false);
    });

    test('matchValue returns true when value matches', () => {
        const route = createRoute('/', { foo: 'bar' });
        const expression = new QueryParamExpression('foo=bar');
        expect(expression.matchValue(route)).toBe(true);
    });

    test('matchValue returns false when value differs', () => {
        const route = createRoute('/', { foo: 'qux' });
        const expression = new QueryParamExpression('foo=bar');
        expect(expression.matchValue(route)).toBe(false);
    });

    test('negated expression matches when param is absent', () => {
        const route = createRoute('/');
        const expression = new QueryParamExpression('!foo');
        expect(expression.match(route)).toBe(true);
    });

    test('negated expression does NOT match when param is present', () => {
        const route = createRoute('/', { foo: '' });
        const expression = new QueryParamExpression('!foo');
        expect(expression.match(route)).toBe(false);
    });
});

describe('MatrixParamExpression', () => {
    test('matchName returns true when a segment carries the matrix param name', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: 'red' } }]);
        const expression = new MatrixParamExpression('color');
        expect(expression.matchName(route)).toBe(true);
    });

    test('matchName returns false when no segment has the name', () => {
        const route = createRouteWithSegments('/foo', [{ data: { size: 'L' } }]);
        const expression = new MatrixParamExpression('color');
        expect(expression.matchName(route)).toBe(false);
    });

    test('matchValue returns true when a segment carries the exact value', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: 'red' } }]);
        const expression = new MatrixParamExpression('color=red');
        expect(expression.matchValue(route)).toBe(true);
    });

    test('matchValue returns false when value differs', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: 'red' } }]);
        const expression = new MatrixParamExpression('color=blue');
        expect(expression.matchValue(route)).toBe(false);
    });

    test('matchName works across multiple segments', () => {
        const route = createRouteWithSegments('/foo', [{ data: { size: 'L' } }, { data: { color: 'red' } }]);
        const expression = new MatrixParamExpression('color');
        expect(expression.matchName(route)).toBe(true);
    });

    test('matchName returns false on route with length 0', () => {
        const route = createRouteWithSegments('/foo', []);
        const expression = new MatrixParamExpression('color');
        expect(expression.matchName(route)).toBe(false);
    });
});

describe('MatrixParamCondition', () => {
    test('it should match matrix parameter names', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: '' } }]);
        const condition = new MatrixParamCondition('color');
        expect(condition.getMatchingCondition(route)).not.toBeNull();

        const condition2 = new MatrixParamCondition('size');
        expect(condition2.getMatchingCondition(route)).toBeNull();
    });

    test('it should match negated matrix parameter names', () => {
        const route = createRouteWithSegments('/foo', []);
        const condition = new MatrixParamCondition('!color');
        expect(condition.getMatchingCondition(route)).not.toBeNull();
    });

    test('it should match matrix parameter values', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: 'red', size: 'L' } }]);
        const condition = new MatrixParamCondition('color=red');
        expect(condition.getMatchingCondition(route)).not.toBeNull();

        const condition2 = new MatrixParamCondition('color=blue');
        expect(condition2.getMatchingCondition(route)).toBeNull();
    });

    test('it should be comparable', () => {
        const cond1 = new MatrixParamCondition('a', 'b', 'c');
        const cond2 = new MatrixParamCondition('a=1', 'b');
        expect(cond1.compareTo(cond2)).toBeLessThan(0);
    });

    test('it should be combinable', () => {
        const cond1 = new MatrixParamCondition('color=red');
        const cond2 = new MatrixParamCondition('size=L');
        const combined = cond1.merge(cond2);
        const content = combined.content;
        expect(content.length).toBe(2);
    });

    test('it should be equatable', () => {
        const cond1 = new MatrixParamCondition('color');
        const cond2 = new MatrixParamCondition('color');
        expect(cond1.equals(cond2)).toBe(true);

        const cond3 = new MatrixParamCondition('size');
        expect(cond1.equals(cond3)).toBe(false);
    });
});
