import { describe, test, expect } from 'vitest';
import { RouteConditionHolder } from '../src/route-condition';

describe.skip('RouteConditionHolder', () => {
    test('it should be comparable', () => {
        const cond1 = new RouteConditionHolder('foo', 'bar', 'baz'),
            cond2 = new RouteConditionHolder('foo=123', 'bar');

        expect(cond1.compareTo(cond2)).toBeLessThan(0);
        expect(cond2.compareTo(cond1)).toBeGreaterThan(0);
    });
});
