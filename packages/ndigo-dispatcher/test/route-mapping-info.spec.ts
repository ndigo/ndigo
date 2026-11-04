/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    QueryParamCondition,
    PatternsRouteCondition,
    RouteMappingInfo,
    QueryParamExpression,
    MatrixParamExpression,
    MatrixParamCondition,
} from '../src/route-mapping-info';
import { Route, RouteSegment } from '@ndigo/router';
import { AccessControlCondition } from '../src/access-control-condition';
import { HTTPMethodCondition } from '../src/http-method-condition';

const createRoute = (path: string, data?: Record<string, string | string[] | null>): Route =>
    ({
        attributes: {},
        data: data ?? {},
        id: 0,
        length: path.length,
        params: {},
        path,
        raw: path,
    }) as unknown as Route;

const createRouteWithSegments = (path: string, segments: Array<{ data: Record<string, string | string[]> }>): Route => {
    const route: Route = {
        attributes: {},
        data: {},
        id: 0,
        length: segments.length,
        params: {},
        path,
        raw: path,
    } as unknown as Route;
    segments.forEach((seg, i) => {
        route[i] = seg as unknown as RouteSegment;
    });
    return route;
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
            matchingFoo = foo.match(route),
            matchingBar = bar.match(route),
            matchingBaz = baz.match(route);

        expect(matchingFoo).not.toBeNull();
        expect(matchingBar).not.toBeNull();
        expect(matchingBaz).toBeNull();
    });

    test('it should match negated parameter names', () => {
        const route = createRoute('/'),
            notFoo = new QueryParamCondition('!foo'),
            matchingNotFoo = notFoo.match(route);

        expect(matchingNotFoo).not.toBeNull();
    });

    test('it should match parameter values', () => {
        const route = createRoute('/', { foo: 'bar', baz: 'qux' }),
            fooBar = new QueryParamCondition('foo=bar'),
            bazBar = new QueryParamCondition('baz=bar'),
            matchingFooBar = fooBar.match(route),
            matchingBazBar = bazBar.match(route);

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
            match = cond.match(createRoute('/foo'));

        expect(match).not.toBeNull();
    });

    test('it should match patterns', () => {
        const cond = new PatternsRouteCondition('/foo/*'),
            match = cond.match(createRoute('/foo/bar'));

        expect(match).not.toBeNull();
    });

    test('it should match root pattern to empty path', () => {
        const cond = new PatternsRouteCondition('/'),
            match = cond.match(createRoute(''));

        expect(match).not.toBeNull();
    });

    test('it should not match root pattern to non-empty path', () => {
        const cond = new PatternsRouteCondition('/'),
            match = cond.match(createRoute('/foo'));

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
            match = merged.match(createRoute(''));

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
        const match = cond.match(createRoute('/foo'));
        expect(match).toStrictEqual(cond);
    });
});

describe('RouteMappingInfo', () => {
    test('it should return this when all sub-conditions are satisfied', () => {
        const info = new RouteMappingInfo('/foo', new PatternsRouteCondition('/foo'));
        const match = info.match(createRoute('/foo'));
        expect(match).toStrictEqual(info);
    });

    test('patterns() exposes the registered patterns as a fresh array (REU-4)', () => {
        const info = new RouteMappingInfo('items', new PatternsRouteCondition('/foo', '/bar'));

        expect(info.patterns()).toEqual(['/foo', '/bar']);

        // The returned array is a copy — mutating it must not touch the mapping.
        const copy = info.patterns();
        copy.push('/baz');
        expect(info.patterns()).toEqual(['/foo', '/bar']);
    });

    test('method() exposes the fixed HTTP method, or undefined for any-method (REU-4)', () => {
        const anyMethod = new RouteMappingInfo('/foo', new PatternsRouteCondition('/foo'));
        const getOnly = new RouteMappingInfo(
            '/foo',
            new PatternsRouteCondition('/foo'),
            new QueryParamCondition(),
            new MatrixParamCondition(),
            null,
            null,
            new HTTPMethodCondition('GET')
        );

        expect(anyMethod.method()).toBeUndefined();
        expect(getOnly.method()).toBe('GET');
    });

    test('returns only matching patterns without changing the registered mapping', () => {
        const info = new RouteMappingInfo('items', new PatternsRouteCondition('/foo', '/bar'));
        const match = info.match(createRoute('/foo'));

        expect(match).not.toBeNull();
        if (match === null) throw new Error('Expected a matching mapping');
        expect([...match.patternsCondition.patterns]).toEqual(['/foo']);
        expect([...info.patternsCondition.patterns]).toEqual(['/foo', '/bar']);
        expect(match.name).toBe('items');
    });

    test('rejects a route when its query condition fails', () => {
        const info = new RouteMappingInfo(null, new PatternsRouteCondition('/foo'), new QueryParamCondition('lang=en'));

        expect(info.match(createRoute('/foo', { lang: 'de' }))).toBeNull();
    });

    test('requires a principal for a private mapping and preserves the access result', () => {
        const access = new AccessControlCondition('private');
        const info = new RouteMappingInfo(
            null,
            new PatternsRouteCondition('/foo'),
            new QueryParamCondition(),
            new MatrixParamCondition(),
            null,
            access
        );

        expect(info.match(createRoute('/foo'))).toBeNull();
        const authenticated = { ...createRoute('/foo'), principal: { id: 'user' } } as Route;
        const match = info.match(authenticated);

        expect(match).not.toBeNull();
        if (match === null) throw new Error('Expected an authenticated matching mapping');
        expect(match.accessCondition).toBe(access);
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

    test('match returns null when matrix condition fails', () => {
        const info = new RouteMappingInfo(
            null,
            new PatternsRouteCondition('/foo'),
            new QueryParamCondition(),
            new MatrixParamCondition('color')
        );
        // No segments — matrix condition cannot match
        const route = createRouteWithSegments('/foo', []);
        expect(info.match(route)).toBeNull();
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

    test('empty-value expression matches an explicit empty value, not a missing key (HT-7)', () => {
        const expression = new QueryParamExpression('q=');
        expect(expression.match(createRoute('/', { q: '' }))).toBe(true);
        expect(expression.match(createRoute('/'))).toBe(false);
        expect(expression.match(createRoute('/', { q: 'x' }))).toBe(false);
    });

    test('repeated query keys match when any aggregated value equals the expression (HT-7)', () => {
        const route = createRoute('/', { q: ['a', 'b'] });
        expect(new QueryParamExpression('q=a').match(route)).toBe(true);
        expect(new QueryParamExpression('q=b').match(route)).toBe(true);
        expect(new QueryParamExpression('q=c').match(route)).toBe(false);
        expect(new QueryParamExpression('q=').match(route)).toBe(false);
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
        const expression = new MatrixParamExpression('color=ndigo');
        expect(expression.matchValue(route)).toBe(false);
    });

    test('matchValue matches when any element of a repeated-key value equals (HT-7)', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: ['red', 'ndigo'] } }]);
        expect(new MatrixParamExpression('color=red').match(route)).toBe(true);
        expect(new MatrixParamExpression('color=ndigo').match(route)).toBe(true);
        expect(new MatrixParamExpression('color=green').match(route)).toBe(false);
    });

    test('matchValue does not match a missing key or a differing segment (HT-7)', () => {
        const route = createRouteWithSegments('/foo', [{ data: { size: 'L' } }]);
        expect(new MatrixParamExpression('color=red').match(route)).toBe(false);
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
        expect(condition.match(route)).not.toBeNull();

        const condition2 = new MatrixParamCondition('size');
        expect(condition2.match(route)).toBeNull();
    });

    test('it should match negated matrix parameter names', () => {
        const route = createRouteWithSegments('/foo', []);
        const condition = new MatrixParamCondition('!color');
        expect(condition.match(route)).not.toBeNull();
    });

    test('it should match matrix parameter values', () => {
        const route = createRouteWithSegments('/foo', [{ data: { color: 'red', size: 'L' } }]);
        const condition = new MatrixParamCondition('color=red');
        expect(condition.match(route)).not.toBeNull();

        const condition2 = new MatrixParamCondition('color=ndigo');
        expect(condition2.match(route)).toBeNull();
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
