/**
 */
import { describe, test, expect } from 'vitest';
import { EqualsPathMatcher, GlobPatternInfo, URLGlobPathMatcher } from '../src/path-matcher';

describe('URLGlobPathMatcher', () => {
    const matcher = new URLGlobPathMatcher();

    test('it should match', () => {
        expect(matcher.match('/foo/*', '/foo/bar')).toBe(true);
        expect(matcher.match('/foo/**', '/foo/bar')).toBe(true);
    });

    test('it should return cached result on repeated calls', () => {
        // First call compiles and caches
        expect(matcher.match('/api/*', '/api/users')).toBe(true);
        // Second call uses cache
        expect(matcher.match('/api/*', '/api/users')).toBe(true);
        expect(matcher.match('/api/*', '/other/path')).toBe(false);
    });

    describe('merge', () => {
        test('it should merge root with root', () => {
            expect(matcher.merge('/', '/')).toBe('/');
        });

        test('it should merge root with path', () => {
            expect(matcher.merge('/', '/foo')).toBe('/foo');
        });

        test('it should merge path with root', () => {
            expect(matcher.merge('/foo', '/')).toBe('/foo');
        });

        test('it should merge non-root paths normally', () => {
            expect(matcher.merge('/foo', '/bar')).toBe('/foo/bar');
        });
    });
});

describe('GlobPatternInfo (KRN-REV-GLOB-15)', () => {
    test('counts a mid-pattern `.*` as a single wildcard', () => {
        expect(new GlobPatternInfo('.*/foo').singleWildcards).toBe(1);
        expect(new GlobPatternInfo('a/.*/b').singleWildcards).toBe(1);
        expect(new GlobPatternInfo('.*').singleWildcards).toBe(1);
    });

    test('uses the mid-pattern wildcard count for specificity comparison', () => {
        const comparator = new URLGlobPathMatcher().getPatternComparator('/target');
        // Both patterns carry exactly one `.*` wildcard, so neither is more
        // specific; before mid-pattern detection, `.*/x` counted zero and lost.
        expect(comparator.compare('.*/x', 'a/.*')).toBe(0);
    });
});

describe('EqualsPathMatcher', () => {
    const matcher = new EqualsPathMatcher();

    describe('merge', () => {
        test('it should merge root with root', () => {
            expect(matcher.merge('/', '/')).toBe('/');
        });

        test('it should merge root with path', () => {
            expect(matcher.merge('/', '/foo')).toBe('/foo');
        });

        test('it should merge path with root', () => {
            expect(matcher.merge('/foo', '/')).toBe('/foo');
        });
    });
});
