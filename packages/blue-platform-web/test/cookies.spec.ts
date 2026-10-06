/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeEach, describe, expect, test } from 'vitest';
import type { CookieParseResult } from '../src/cookies';
import Cookies from '../src/cookies';

describe('Cookies', () => {
    beforeEach(() => {
        Object.defineProperty(document, 'cookie', {
            configurable: true,
            get: () => 'theme=dark; user=blue',
        });
    });

    test('it should parse cookies through run()', () => {
        const parseResult = Cookies.run('theme=dark; user=blue') as Extract<CookieParseResult, { isError: false }>;

        expect(parseResult.isError).toBe(false);
        expect(parseResult.result).toEqual({ theme: 'dark', user: 'blue' });
    });

    test('it should return raw cookie value with get()', () => {
        expect(Cookies.get('theme')).toBe('dark');
        expect(Cookies.get('user')).toBe('blue');
    });

    test('it should return cookie jar when no key is provided', () => {
        expect(Cookies.get(null as unknown as string)).toEqual({ theme: 'dark', user: 'blue' });
    });

    test('it should ignore malformed cookie pairs', () => {
        Object.defineProperty(document, 'cookie', {
            configurable: true,
            get: () => 'valid=ok; malformed',
        });

        expect(Cookies.get(null as unknown as string)).toEqual({ valid: 'ok' });
    });

    test('it should return undefined for a missing key instead of throwing', () => {
        expect(Cookies.get('missing')).toBeUndefined();
        expect(Cookies.getJSON('missing')).toBeUndefined();
    });

    test('it should still parse present JSON cookie values with getJSON()', () => {
        Object.defineProperty(document, 'cookie', {
            configurable: true,
            get: () => 'prefs=%7B%22theme%22%3A%22dark%22%7D',
        });

        expect(Cookies.getJSON('prefs')).toEqual({ theme: 'dark' });
    });

    test('it should truncate a semicolon payload in an attribute value (SE-11)', () => {
        let written = '';
        Object.defineProperty(document, 'cookie', {
            configurable: true,
            get: () => '',
            set: (value: string) => {
                written = value;
            },
        });

        // The old `.split(' ;')` kept `; Domain=evil.example` intact (no space
        // before the semicolon), injecting an attacker-supplied attribute.
        Cookies.set('theme', 'dark', { path: '/; Domain=evil.example' });
        expect(written).toBe('theme=dark; path=/');

        Cookies.set('theme', 'dark', { domain: 'example.com; Secure' });
        expect(written).toBe('theme=dark; path=/; domain=example.com');
    });

    test('it should reject attribute names carrying ";" or CR/LF (SE-11)', () => {
        Object.defineProperty(document, 'cookie', {
            configurable: true,
            get: () => '',
            set: () => undefined,
        });

        expect(() => Cookies.set('theme', 'dark', { ['x; Domain=evil.example']: '1' })).toThrow(TypeError);
        expect(() => Cookies.set('theme', 'dark', { ['x\r\nSet-Cookie: y=1']: '1' })).toThrow(TypeError);
    });
});
