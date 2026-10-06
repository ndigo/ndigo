/**
 * Mock request→route parity (IN-4): `buildRoute` must mirror the live
 * `NodeHTTPServerAdapter`'s HTTP parsing — repeated query parameters become
 * arrays (`?a=1&a=2` → `['1', '2']`) and the map carries no prototype
 * (SEC-8), so `?__proto__=x` stays an ordinary parameter key.
 *
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { buildRoute, createMemoryResponse, type MockRequest } from '../src/index';

describe('buildRoute query parity (IN-4)', () => {
    test('repeated query values are arrays, matching ?a=1&a=2 on the live adapter', () => {
        const { sink } = createMemoryResponse();
        const request: MockRequest = { path: '/search', query: { a: ['1', '2'] } };

        const { route } = buildRoute(request, sink);

        expect(route.data['a']).toEqual(['1', '2']);
    });

    test('the query map has a null prototype so __proto__ stays an ordinary key (SEC-8)', () => {
        const { sink } = createMemoryResponse();
        // Computed key: an own `__proto__` data property on the spec, not a
        // prototype assignment.
        const request: MockRequest = { path: '/search', query: { ['__proto__']: 'x' } };

        const { route } = buildRoute(request, sink);
        const data = route.data as Record<string, unknown>;

        expect(Object.getPrototypeOf(data)).toBeNull();
        expect(Object.getOwnPropertyDescriptor(data, '__proto__')).toMatchObject({
            value: 'x',
            writable: true,
            enumerable: true,
            configurable: true,
        });
        // Reading through the key returns the value, never the prototype slot.
        expect(data['__proto__']).toBe('x');
    });
});
