/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { Route } from '@blue/router';
import { HTTPMethodCondition } from '../src/http-method-condition';

const routeFor = (method?: string): Route => ({ method, path: '/x', data: {}, params: {}, attributes: {} }) as Route;

describe('HTTPMethodCondition (D-8: HEAD falls back to GET)', () => {
    test('exact method matches', () => {
        expect(new HTTPMethodCondition('GET').getMatchingCondition(routeFor('GET'))).not.toBeNull();
        expect(new HTTPMethodCondition('POST').getMatchingCondition(routeFor('GET'))).toBeNull();
    });

    test('a HEAD request matches a GET-constrained mapping (RFC 9110 §9.3.2)', () => {
        const condition = new HTTPMethodCondition('GET');
        const match = condition.getMatchingCondition(routeFor('HEAD'));
        expect(match).toBe(condition);
    });

    test('HEAD does not match non-GET constraints', () => {
        expect(new HTTPMethodCondition('POST').getMatchingCondition(routeFor('HEAD'))).toBeNull();
    });

    test('an unconstrained condition matches anything', () => {
        expect(new HTTPMethodCondition().getMatchingCondition(routeFor('HEAD'))).not.toBeNull();
        expect(new HTTPMethodCondition().getMatchingCondition(routeFor('DELETE'))).not.toBeNull();
    });

    test('the method-less route matches a constrained condition (any method on the mapping)', () => {
        expect(new HTTPMethodCondition('GET').getMatchingCondition(routeFor(undefined))).not.toBeNull();
    });
});
