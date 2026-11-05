/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { Route } from '@ndigo/router';
import { MatrixValueMethodArgumentResolver, MethodParameter, MethodParameterType } from '../src/index';

/**
 * Builds a Route in the segment shape the router produces: for a URL like
 * `/books;color=red;tag=a;tag=b` the matched segment carries
 * `{ name: 'books', data: { color: 'red', tag: ['a', 'b'] } }` (repeated and
 * comma-joined matrix values are folded into arrays at parse time —
 * `MatrixString.parse`).
 */
function makeRoute(segmentData: Record<string, unknown>, routeData: Record<string, unknown> = {}): Route {
    return {
        id: 1,
        length: 1,
        path: '/books',
        raw: '/books',
        params: {},
        data: routeData,
        attributes: {},
        0: { name: 'books', raw: 'books', data: segmentData },
    } as unknown as Route;
}

const resolver = new MatrixValueMethodArgumentResolver();
const mapping = { value: '/books' };

describe('MatrixValueMethodArgumentResolver (D-7 parity)', () => {
    test('supports MATRIX parameters only', () => {
        expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.MATRIX, 'color'))).toBe(true);
        expect(resolver.supportsParameter(new MethodParameter(MethodParameterType.QUERY, 'color'))).toBe(false);
    });

    test('resolves a single matrix value from the mapped path segment', () => {
        const route = makeRoute({ color: 'red' });
        const param = new MethodParameter(MethodParameterType.MATRIX, 'color');

        expect(resolver.resolveArgument(param, route, mapping)).toBe('red');
    });

    test('repeated matrix params bind as an array, unchanged from the parser', () => {
        // /books;tag=a;tag=b  →  segment.data.tag === ['a', 'b']
        const route = makeRoute({ tag: ['a', 'b'] });
        const param = new MethodParameter(MethodParameterType.MATRIX, 'tag');

        expect(resolver.resolveArgument(param, route, mapping)).toEqual(['a', 'b']);
    });

    test('comma-joined matrix values bind as an array too', () => {
        // /books;id=1,2,3  →  segment.data.id === ['1', '2', '3']
        const route = makeRoute({ id: ['1', '2', '3'] });
        const param = new MethodParameter(MethodParameterType.MATRIX, 'id');

        expect(resolver.resolveArgument(param, route, mapping)).toEqual(['1', '2', '3']);
    });

    test('falls back to route.data when the mapped segment carries no value', () => {
        const route = makeRoute({}, { color: 'ndigo' });
        const param = new MethodParameter(MethodParameterType.MATRIX, 'color');

        expect(resolver.resolveArgument(param, route, mapping)).toBe('ndigo');
    });

    test('single-value behavior is unchanged for missing values', () => {
        const route = makeRoute({});
        const param = new MethodParameter(MethodParameterType.MATRIX, 'color', false, 'default');

        expect(resolver.resolveArgument(param, route, mapping)).toBe('default');
    });

    test('asNumber(matrixValue(...)) converts the raw matrix string (COR-11)', () => {
        // /books;size=42  →  segment.data.size === '42'; convertType converts.
        const route = makeRoute({ size: '42' });
        const param = new MethodParameter(MethodParameterType.MATRIX, 'size', false, null, {
            source: String,
            target: Number,
        });

        expect(resolver.resolveArgument(param, route, mapping)).toBe(42);
    });
});
