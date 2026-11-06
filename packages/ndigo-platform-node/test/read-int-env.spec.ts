/**
 * `readIntEnv` specs (HG-9): the single env-integer contract shared by the
 * socket-limit, socket-registry, and managed-server resolvers.
 */
import { describe, test, expect } from 'vitest';
import { readIntEnv } from '../src/read-int-env';

describe('readIntEnv (HG-9)', () => {
    test('unset and empty values fall through to the caller default', () => {
        expect(readIntEnv({}, 'X')).toBeUndefined();
        expect(readIntEnv({ X: '' }, 'X')).toBeUndefined();
    });

    test('parses all-digits values as integers', () => {
        expect(readIntEnv({ X: '8080' }, 'X')).toBe(8080);
        expect(readIntEnv({ X: '0' }, 'X', { allowZero: true })).toBe(0);
    });

    test('rejects zero unless allowZero is set', () => {
        expect(() => readIntEnv({ X: '0' }, 'X')).toThrow(RangeError);
        expect(() => readIntEnv({ X: '0' }, 'X')).toThrow(/X must be a positive integer/);
    });

    test('rejects non-integer literals fail-fast (no silent coercion)', () => {
        for (const raw of ['-1', '1.5', '1e3', '0x10', ' 80 ', 'abc', '+5']) {
            expect(() => readIntEnv({ X: raw }, 'X', { allowZero: true })).toThrow(RangeError);
        }
    });
});
