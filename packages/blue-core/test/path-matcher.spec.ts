import { describe, test, expect } from 'vitest';
import { GlobPathMatcher } from '../src/path-matcher';

describe('GlobPathMatcher', () => {
    const matcher = new GlobPathMatcher();

    test('it should match', () => {
        expect(matcher.match('/foo/*', '/foo/bar')).toBe(true);
        expect(matcher.match('/foo/**', '/foo/bar')).toBe(true);
    });
});
