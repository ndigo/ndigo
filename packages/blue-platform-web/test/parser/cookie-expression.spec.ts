import { describe, expect, it } from 'vitest';
import cookies from '../../src/cookies';

describe('cookies', function () {
    describe('it should parse', function () {
        it('should handle common values', () => {
            expect(cookies.run('c="').result).toEqual({ c: '"' });
            expect(cookies.run('c="content').result).toEqual({ c: '"content' });
            expect(cookies.run('c=content"').result).toEqual({ c: 'content"' });
            expect(cookies.run('c=#').result).toEqual({ c: '#' });
            expect(cookies.run('c==').result).toEqual({ c: '=' });
            expect(cookies.run('c=123; d=456').result).toEqual({ c: '123', d: '456' });
        });
    });

    describe('it should parse percent encoded characters', function () {
        it('should decode percent-encoded values', () => {
            expect(cookies.run('c=%20').result).toEqual({ c: ' ' });
            expect(cookies.run('c=%3B%3B').result).toEqual({ c: ';;' });
            expect(cookies.run('c=%25').result).toEqual({ c: '%' });
        });
    });

    describe('it should parse multi-byte characters', function () {
        it('should decode multi-byte sequences', () => {
            expect(cookies.run('c=%C3%A3').result).toEqual({ c: 'ã' });
            expect(cookies.run('c=%E2%82%AF').result).toEqual({ c: '₯' });
            expect(cookies.run('c=%F0%A9%B8%BD').result).toEqual({ c: '𩸽' });
        });
    });
});
