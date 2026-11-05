/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { parseCookieHeader } from '../../src/parser/cookie-parser';

const parseCookies = (input: string): Record<string, string> => parseCookieHeader(input);

describe('cookies', function () {
    describe('it should parse', function () {
        it('should handle common values', () => {
            expect(parseCookies('c="')).toEqual({ c: '"' });
            expect(parseCookies('c="content')).toEqual({ c: '"content' });
            expect(parseCookies('c=content"')).toEqual({ c: 'content"' });
            expect(parseCookies('c=#')).toEqual({ c: '#' });
            expect(parseCookies('c==')).toEqual({ c: '=' });
            expect(parseCookies('c=123; d=456')).toEqual({ c: '123', d: '456' });
        });
    });

    describe('it should parse percent encoded characters', function () {
        it('should decode percent-encoded values', () => {
            expect(parseCookies('c=%20')).toEqual({ c: ' ' });
            expect(parseCookies('c=%3B%3B')).toEqual({ c: ';;' });
            expect(parseCookies('c=%25')).toEqual({ c: '%' });
        });
    });

    describe('it should parse multi-byte characters', function () {
        it('should decode multi-byte sequences', () => {
            expect(parseCookies('c=%C3%A3')).toEqual({ c: 'ã' });
            expect(parseCookies('c=%E2%82%AF')).toEqual({ c: '₯' });
            expect(parseCookies('c=%F0%A9%B8%BD')).toEqual({ c: '𩸽' });
        });
    });
});
