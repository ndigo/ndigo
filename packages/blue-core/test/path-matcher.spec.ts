import { describe, test, expect } from 'vitest';
import { EqualsPathMatcher, URLGlobPathMatcher } from '../src/path-matcher';

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
