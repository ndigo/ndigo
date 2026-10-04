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
        expect(new HTTPMethodCondition('GET').match(routeFor('GET'))).not.toBeNull();
        expect(new HTTPMethodCondition('POST').match(routeFor('GET'))).toBeNull();
    });

    test('a HEAD request matches a GET-constrained mapping (RFC 9110 §9.3.2)', () => {
        const condition = new HTTPMethodCondition('GET');
        const match = condition.match(routeFor('HEAD'));
        expect(match).toBe(condition);
    });

    test('HEAD does not match non-GET constraints', () => {
        expect(new HTTPMethodCondition('POST').match(routeFor('HEAD'))).toBeNull();
    });

    test('an unconstrained condition matches anything', () => {
        expect(new HTTPMethodCondition().match(routeFor('HEAD'))).not.toBeNull();
        expect(new HTTPMethodCondition().match(routeFor('DELETE'))).not.toBeNull();
    });

    test('the method-less route matches a constrained condition (any method on the mapping)', () => {
        expect(new HTTPMethodCondition('GET').match(routeFor(undefined))).not.toBeNull();
    });
});

describe('HTTPMethodCondition.compareTo (COR-10: explicit HEAD beats the GET fallback)', () => {
    const headRoute = routeFor('HEAD');
    const headCondition = new HTTPMethodCondition('HEAD');
    const getCondition = new HTTPMethodCondition('GET');

    test('an explicit HEAD mapping sorts before a GET-only mapping for a HEAD request', () => {
        expect(headCondition.compareTo(getCondition, headRoute)).toBeLessThan(0);
    });

    test('registration order does not matter — the GET-mapping side reports the HEAD mapping as more specific', () => {
        expect(getCondition.compareTo(headCondition, headRoute)).toBeGreaterThan(0);
    });

    test('the HEAD→GET fallback still serves HEAD when only a GET mapping is registered', () => {
        expect(getCondition.match(headRoute)).toBe(getCondition);
    });

    test('without a HEAD request (or without a route) the two concrete conditions remain equally specific', () => {
        const getRoute = routeFor('GET');
        expect(headCondition.compareTo(getCondition, getRoute)).toBe(0);
        expect(getCondition.compareTo(headCondition, getRoute)).toBe(0);
        expect(headCondition.compareTo(getCondition)).toBe(0);
    });

    test('the any-method condition still loses to a concrete method', () => {
        const anyCondition = new HTTPMethodCondition();
        expect(anyCondition.compareTo(getCondition, headRoute)).toBeGreaterThan(0);
        expect(getCondition.compareTo(anyCondition, headRoute)).toBeLessThan(0);
    });
});
