/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { RouteCondition, RouteConditionHolder, CompositeRouteCondition } from '../src/route-condition';
import { QueryParamExpression, QueryParamCondition, PatternsRouteCondition } from '../src/route-mapping-info';
import { PathRoute } from '@blue/router';

class NumericCondition implements RouteCondition<NumericCondition> {
    readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    merge(other: NumericCondition): NumericCondition {
        return new NumericCondition(this.value + other.value);
    }

    match(): NumericCondition {
        return this;
    }

    compareTo(other: NumericCondition): number {
        return this.value - other.value;
    }
}

describe('RouteConditionHolder', () => {
    test('it should compare wrapped conditions', () => {
        const cond1 = new RouteConditionHolder(new NumericCondition(1));
        const cond2 = new RouteConditionHolder(new NumericCondition(2));

        expect(cond1.compareTo(cond2)).toBeLessThan(0);
        expect(cond2.compareTo(cond1)).toBeGreaterThan(0);
    });

    test('it should merge wrapped conditions', () => {
        const cond1 = new RouteConditionHolder(new NumericCondition(2));
        const cond2 = new RouteConditionHolder(new NumericCondition(3));
        const merged = cond1.merge(cond2);

        expect((merged.condition as NumericCondition).value).toBe(5);
    });

    test('it should return matching condition when route matches', () => {
        const cond = new RouteConditionHolder(new NumericCondition(7));

        const match = cond.match(new PathRoute('/foo'));

        expect(match).not.toBeNull();
        if (match === null) throw new Error('Expected a matching condition');
        expect((match.condition as NumericCondition).value).toBe(7);
    });
});

describe('CompositeRouteCondition', () => {
    test('narrows every condition to its matching result', () => {
        const patterns = new PatternsRouteCondition('/foo', '/bar');
        const params = new QueryParamCondition('lang=en');
        const composite = new CompositeRouteCondition(patterns, params);
        const route = { path: '/foo', data: { lang: 'en' }, attributes: {} } as unknown as PathRoute;
        const match = composite.match(route);

        expect(match).not.toBeNull();
        if (match === null) throw new Error('Expected a matching composite');
        const otherPath = { ...route, path: '/bar' } as PathRoute;
        const otherQuery = { ...route, data: { lang: 'de' } } as unknown as PathRoute;
        expect(composite.match(otherPath)).not.toBeNull();
        expect(match.match(otherPath)).toBeNull();
        expect(match.match(otherQuery)).toBeNull();
        expect(match.match(route)).not.toBeNull();
        expect([...patterns.patterns]).toEqual(['/foo', '/bar']);
    });

    test('rejects the route when any condition fails', () => {
        const composite = new CompositeRouteCondition(
            new PatternsRouteCondition('/foo'),
            new QueryParamCondition('lang=en')
        );
        const route = { path: '/foo', data: { lang: 'de' }, attributes: {} } as unknown as PathRoute;

        expect(composite.match(route)).toBeNull();
    });
});

describe('AbstractNameValueExpression implements Matchable<Route> (MTC-1)', () => {
    test('matches() is equivalent to match() for matching routes', () => {
        const expression = new QueryParamExpression('lang=en');
        const route = { path: '/', method: 'GET', data: { lang: 'en' }, attributes: {} } as unknown as PathRoute;

        expect(expression.match(route)).toBe(true);
        expect(expression.matches(route)).toBe(true);
        expect(expression.matches(route)).toBe(expression.match(route));
    });

    test('matches() reports non-matching routes like match()', () => {
        const expression = new QueryParamExpression('lang=en');
        const route = { path: '/', method: 'GET', data: { lang: 'de' }, attributes: {} } as unknown as PathRoute;

        expect(expression.match(route)).toBe(false);
        expect(expression.matches(route)).toBe(false);
        expect(expression.matches(route)).toBe(expression.match(route));
    });
});
