
import { describe, test, expect } from 'vitest';
import { PathPatternComparator } from '../src/path-pattern-comparator';

const comparator = new PathPatternComparator();

describe('PathPatternComparator specificity (D-1 greedy ordering)', () => {
    test('exact patterns beat wildcard patterns', () => {
        expect(comparator.compare('/users/list', '/users/{*rest}')).toBeLessThan(0);
        expect(comparator.compare('/users/{*rest}', '/users/list')).toBeGreaterThan(0);
    });

    test('per-segment param beats greedy at the same position', () => {
        // The greedy spelling is longer, but the greedy penalty outranks the
        // length rule — `/static/{file}` binds one segment, `{*file}` any depth.
        expect(comparator.compare('/static/{file}', '/static/{*file}')).toBeLessThan(0);
        expect(comparator.compare('/static/{*file}', '/static/{file}')).toBeGreaterThan(0);
    });

    test('single-segment wildcards sort before greedy at the same position', () => {
        expect(comparator.compare('/files/*', '/files/{*rest}')).toBeLessThan(0);
    });

    test('a deeper greedy anchor is more specific than a shallow one', () => {
        expect(comparator.compare('/static/assets/{*file}', '/static/{*file}')).toBeLessThan(0);
    });

    test('a deeper param pattern beats a greedy one at a shallower anchor', () => {
        expect(comparator.compare('/a/b/{file}', '/a/{*rest}')).toBeLessThan(0);
    });

    test('both catch-all spellings sort below exact and param patterns', () => {
        expect(comparator.compare('/x/{file}', '/**')).toBeLessThan(0);
        expect(comparator.compare('/x/{file}', '/{*rest}')).toBeLessThan(0);
        expect(comparator.compare('/', '/**')).toBeLessThan(0);
    });
});
