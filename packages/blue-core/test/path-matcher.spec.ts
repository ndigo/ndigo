import { describe, test, expect } from 'vitest';
import { EqualsPathMatcher, GlobPathMatcher } from '../src/path-matcher';

describe('GlobPathMatcher', () => {
    const matcher = new GlobPathMatcher();

    test('it should match', () => {
        expect(matcher.match('/foo/*', '/foo/bar')).toBe(true);
        expect(matcher.match('/foo/**', '/foo/bar')).toBe(true);
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
