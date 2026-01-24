import { GlobPathMatcher } from '../src/path-matcher';

describe('GlobPathMatcher', function () {
    let matcher = new GlobPathMatcher();

    test('it should match', function () {
        expect(matcher.match('/foo/*', '/foo/bar')).toBe(true);
        expect(matcher.match('/foo/**', '/foo/bar')).toBe(true);
    });
});
