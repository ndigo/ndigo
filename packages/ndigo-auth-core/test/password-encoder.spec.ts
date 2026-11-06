/**
 */
import { describe, test, expect } from 'vitest';
import { UnknownPasswordSchemeError } from '../src/password-encoder';
import { ScryptPasswordEncoder } from '../src/scrypt-password-encoder';
import { DelegatingPasswordEncoder } from '../src/delegating-password-encoder';

function freshScrypt(
    overrides: { ln?: number; r?: number; p?: number; keyLength?: number } = {}
): ScryptPasswordEncoder {
    return new ScryptPasswordEncoder(overrides);
}

describe('ScryptPasswordEncoder', () => {
    test('encode produces a self-describing hash with embedded parameters', () => {
        const encoder = freshScrypt();
        const hash = encoder.encode('correct horse battery staple');
        expect(hash).toMatch(/^\$ln=17,r=8,p=1\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/);
    });

    test('verify returns true for the correct password', () => {
        const encoder = freshScrypt();
        const hash = encoder.encode('s3cret-pass');
        expect(encoder.verify('s3cret-pass', hash)).toBe(true);
    });

    test('verify returns false for a wrong password', () => {
        const encoder = freshScrypt();
        const hash = encoder.encode('s3cret-pass');
        expect(encoder.verify('wrong', hash)).toBe(false);
    });

    test('two encodes of the same password differ (per-user salt)', () => {
        const encoder = freshScrypt();
        expect(encoder.encode('same-pw')).not.toBe(encoder.encode('same-pw'));
    });

    test('stored hashes with out-of-range cost parameters are rejected (SEC-1)', () => {
        const encoder = freshScrypt();
        // An attacker-poisoned stored hash inflates ln past the cap: both
        // paths reject the string without ever reaching scrypt at that cost
        // (the format is self-describing, so parsing is where it must stop).
        const inflated = encoder.encode('pw').replace('ln=17', 'ln=30');
        expect(() => encoder.verify('pw', inflated)).toThrow(UnknownPasswordSchemeError);
        expect(() => encoder.needsRehash(inflated)).toThrow(UnknownPasswordSchemeError);
    });

    test('cost parameters round-trip through the hash string', () => {
        const encoder = freshScrypt({ ln: 15, r: 8, p: 1 });
        const hash = encoder.encode('pw');
        expect(hash).toMatch(/^\$ln=15,r=8,p=1\$/);
        // A default-parameter encoder accepts hashes produced with cheaper cost parameters.
        expect(freshScrypt().verify('pw', hash)).toBe(true);
    });

    test('needsRehash is false for a fresh hash with current parameters', () => {
        const encoder = freshScrypt();
        expect(encoder.needsRehash(encoder.encode('pw'))).toBe(false);
    });

    test('needsRehash is true when cost parameters drift from the configured default', () => {
        const encoder = freshScrypt({ ln: 17 });
        const outdated = freshScrypt({ ln: 15 }).encode('pw');
        expect(encoder.needsRehash(outdated)).toBe(true);
    });

    test('needsRehash is true when the derived key length drifts', () => {
        const encoder = freshScrypt({ keyLength: 32 });
        const old = freshScrypt({ keyLength: 16 }).encode('pw');
        expect(encoder.needsRehash(old)).toBe(true);
    });

    test('verify rejects a tampered hash without throwing', () => {
        const encoder = freshScrypt();
        const hash = encoder.encode('pw');
        const tampered = hash.slice(0, -2) + (hash.endsWith('AA') ? 'BB' : 'AA');
        expect(encoder.verify('pw', tampered)).toBe(false);
    });

    test('verify throws UnknownPasswordSchemeError on a malformed hash', () => {
        const encoder = freshScrypt();
        expect(() => encoder.verify('pw', 'not-a-hash')).toThrow(UnknownPasswordSchemeError);
        expect(() => encoder.verify('pw', '$ln=17$salt$hash')).toThrow(UnknownPasswordSchemeError);
    });

    test('invalid option values fail loud', () => {
        expect(() => new ScryptPasswordEncoder({ ln: 0 })).toThrow(RangeError);
        expect(() => new ScryptPasswordEncoder({ r: -1 })).toThrow(RangeError);
    });
});

describe('DelegatingPasswordEncoder', () => {
    function delegating(defaultId = 'scrypt') {
        return new DelegatingPasswordEncoder(
            {
                scrypt: freshScrypt(),
                test: {
                    encode: (raw: string) => `plain:${raw}`,
                    verify: (raw: string, encoded: string) => encoded === `plain:${raw}`,
                    needsRehash: () => false,
                },
            },
            defaultId
        );
    }

    test('encode routes to the default encoder and wraps with its scheme id', () => {
        const encoder = delegating();
        expect(encoder.encode('pw')).toMatch(/^\{scrypt\}\$ln=17/);
        expect(delegating('test').encode('pw')).toBe('{test}plain:pw');
    });

    test('verify dispatches on the scheme prefix', () => {
        const encoder = delegating();
        const scryptHash = encoder.encode('pw');
        expect(encoder.verify('pw', scryptHash)).toBe(true);
        expect(encoder.verify('pw', '{test}plain:pw')).toBe(true);
        expect(encoder.verify('nope', '{test}plain:pw')).toBe(false);
    });

    test('verify throws UnknownPasswordSchemeError for an unknown scheme', () => {
        const encoder = delegating();
        expect(() => encoder.verify('pw', '{bcrypt}whatever')).toThrow(UnknownPasswordSchemeError);
    });

    test('verify throws UnknownPasswordSchemeError when the scheme prefix is missing', () => {
        const encoder = delegating();
        expect(() => encoder.verify('pw', 'plaintext')).toThrow(UnknownPasswordSchemeError);
        expect(() => encoder.verify('pw', '')).toThrow(UnknownPasswordSchemeError);
    });

    test('needsRehash is false for a fresh hash under the default scheme', () => {
        const encoder = delegating();
        expect(encoder.needsRehash(encoder.encode('pw'))).toBe(false);
    });

    test('needsRehash is true for a non-default scheme', () => {
        const encoder = delegating();
        expect(encoder.needsRehash('{test}plain:pw')).toBe(true);
    });

    test('needsRehash is true when stored parameters drift from the default encoder', () => {
        const encoder = delegating();
        const outdated = freshScrypt({ ln: 15 }).encode('pw');
        expect(encoder.needsRehash(`{scrypt}${outdated}`)).toBe(true);
    });

    test('throws when the default scheme id is not registered', () => {
        expect(() => new DelegatingPasswordEncoder({ scrypt: freshScrypt() }, 'missing')).toThrow(
            UnknownPasswordSchemeError
        );
    });

    test('unknown schemes also fail loud through needsRehash', () => {
        expect(() => delegating().needsRehash('{argon2id}$v=19$m=65536$salt$hash')).toThrow(UnknownPasswordSchemeError);
    });
});
