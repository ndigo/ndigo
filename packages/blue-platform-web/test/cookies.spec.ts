import { beforeEach, describe, expect, test } from 'vitest';
import type { Ok } from '@blue/parser';
import Cookies from '../src/cookies';

describe('Cookies', () => {
    beforeEach(() => {
        Object.defineProperty(document, 'cookie', {
            configurable: true,
            get: () => 'theme=dark; user=blue',
        });
    });

    test('it should parse cookies through run()', () => {
        const parseResult = Cookies.run('theme=dark; user=blue') as Ok<Record<string, string>, string>;

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
});
