/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { RouteCondition, RouteConditionHolder } from '../src/route-condition';
import { PathRoute } from '@blue/router';

class NumericCondition implements RouteCondition<NumericCondition> {
    readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    merge(other: NumericCondition): NumericCondition {
        return new NumericCondition(this.value + other.value);
    }

    getMatchingCondition(): NumericCondition {
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

        const match = cond.getMatchingCondition(new PathRoute('/foo'));

        expect(match).toBeTruthy();
        expect((match.condition as NumericCondition).value).toBe(7);
    });
});
