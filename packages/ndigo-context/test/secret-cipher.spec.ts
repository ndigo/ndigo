/**
 * Secret marker + decryptor specs (AD-29 Wave 2): marker parsing, scheme
 * dispatch, pass-through of non-marker values, resolver integration
 * (placeholders-then-decrypt, key-path AAD, typed reads), and the wiring
 * capability gate.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { parseSecretMarker, SecretCipher } from '../src/secret-cipher';
import { FrameworkError } from '@ndigo/core';
import { SecretSchemeRegistry } from '../src/secret-scheme-registry';
import { StandardEnvironment } from '../src/environment';

/** Deterministic fake cipher: `{test:<b64>}` — base64 "encryption" + AAD bind. */
const fakeCipher = (): SecretCipher & {
    calls: { encrypt: string[]; decrypt: string[] };
} => {
    const calls: { encrypt: string[]; decrypt: string[] } = {
        encrypt: [],
        decrypt: [],
    };
    const base64 = (s: string): string => Buffer.from(s, 'utf8').toString('base64');
    const cipher: SecretCipher = {
        scheme: 'test',
        capabilities: { aad: true },
        encrypt(plain: string, aad?: string): string {
            calls.encrypt.push(aad ?? '');
            return `{test:${base64(`${plain}|${aad ?? ''}`)}}`;
        },
        decrypt(marker: string, aad?: string): string {
            calls.decrypt.push(aad ?? '');
            const payload = marker.slice(1, -1).replace(/^test:/, '');
            const [plain, bound] = Buffer.from(payload, 'base64').toString('utf8').split('|');
            if (bound !== (aad ?? '')) throw new Error(`AAD mismatch: key path bound "${bound}" ≠ "${aad}"`);
            return plain;
        },
    };
    return { ...cipher, calls };
};

describe('parseSecretMarker', () => {
    test('parses scheme:version:payload', () => {
        expect(parseSecretMarker('{cipher:v1:abc}')).toEqual({
            scheme: 'cipher',
            version: 'v1',
            payload: 'abc',
        });
    });

    test('parses scheme:payload without version', () => {
        expect(parseSecretMarker('{jwe:eyJ…}')).toEqual({
            scheme: 'jwe',
            version: null,
            payload: 'eyJ…',
        });
    });

    test('returns null for non-marker strings (pass-through)', () => {
        expect(parseSecretMarker('plain-value')).toBeNull();
        expect(parseSecretMarker('{not:closed')).toBeNull();
        expect(parseSecretMarker('{}')).toBeNull();
        expect(parseSecretMarker('{UPPER:x}')).toBeNull(); // scheme charset
        expect(parseSecretMarker('')).toBeNull();
        expect(parseSecretMarker(undefined as unknown as string)).toBeNull();
    });

    test('fails loud on a non-conforming numeric version segment', () => {
        // A segment after `scheme:` claims to be the version; a numeric one
        // such as `1` must not be silently folded into the payload.
        expect(() => parseSecretMarker('{cipher:1:payload}')).toThrow(FrameworkError);
        expect(() => parseSecretMarker('{cipher:123:payload}')).toThrow(/Malformed secret marker/);
    });

    test('parses a conforming letter-first version segment', () => {
        expect(parseSecretMarker('{cipher:v1:payload}')).toEqual({
            scheme: 'cipher',
            version: 'v1',
            payload: 'payload',
        });
    });

    test('payload may contain colons (scheme payload carries the rest)', () => {
        // A single alnum segment after `scheme:` is the version; the payload
        // carries everything after it — colons included.
        expect(parseSecretMarker('{cipher:v9:b:c}')).toEqual({
            scheme: 'cipher',
            version: 'v9',
            payload: 'b:c',
        });
        expect(parseSecretMarker('{cipher:iv:tag:ct}')).toEqual({
            scheme: 'cipher',
            version: 'iv',
            payload: 'tag:ct',
        });
        // No version: payload begins immediately after `scheme:`.
        expect(parseSecretMarker('{jwe:eyJ.abc}')).toEqual({
            scheme: 'jwe',
            version: null,
            payload: 'eyJ.abc',
        });
    });
});

describe('SecretSchemeRegistry (AD-29 D-3)', () => {
    test('registers ciphers and dispatches decrypt by scheme', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);

        const marker = cipher.encrypt('s3cret', 'db.password');
        expect(registry.decrypt(marker, { key: 'db.password' })).toBe('s3cret');
        expect(cipher.calls.decrypt).toEqual(['db.password']); // key path as AAD
    });

    test('refuses to wire a cipher without AAD capability', () => {
        const registry = new SecretSchemeRegistry();
        const noAad = {
            scheme: 'legacy',
            capabilities: { aad: false },
            encrypt: (plain: string) => plain,
            decrypt: (marker: string) => marker,
        };
        expect(() => registry.register(noAad)).toThrow(/does not support AAD binding/);
    });

    test('passes non-marker values through untouched', () => {
        const registry = new SecretSchemeRegistry();
        registry.register(fakeCipher());
        expect(registry.decrypt('plain-value', { key: 'a' })).toBe('plain-value');
        expect(registry.decrypt('{no-closing-brace', { key: 'a' })).toBe('{no-closing-brace');
        expect(registry.decrypt('{}', { key: 'a' })).toBe('{}');
    });

    test('fails loud on an unregistered scheme (never plaintext fallback)', () => {
        const registry = new SecretSchemeRegistry();
        expect(() => registry.decrypt('{jwe:eyJ…}', { key: 'x' })).toThrow(/unregistered scheme "jwe"/);
    });
});

describe('resolver secret integration (AD-29 D-5)', () => {
    test('decrypts {cipher:...} values at lookup with key-path AAD', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        const env = new StandardEnvironment([{ db: { password: marker } }]);
        env.applySecretDecryptor(registry);

        expect(env.getProperty('db.password')).toBe('s3cret-pass');
        expect(env.getPropertyAs('db.password', String)).toBe('s3cret-pass');
    });

    test('getRawProperty returns the raw cipher marker while getProperty decrypts', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        const env = new StandardEnvironment([{ db: { password: marker } }]);
        env.applySecretDecryptor(registry);

        // Raw index lookup: the {cipher:...} marker must be distinguishable
        // from the resolved value (COR-8) — ciphertext intact, no decryption.
        expect(env.getRawProperty('db.password')).toBe(marker);
        expect(env.getProperty('db.password')).toBe('s3cret-pass');
    });

    test('getRawProperty bypasses placeholder resolution while getProperty resolves', () => {
        const env = new StandardEnvironment([
            { db: { password: '${secrets.stored}' }, secrets: { stored: 'real-value' } },
        ]);

        expect(env.getRawProperty('db.password')).toBe('${secrets.stored}');
        expect(env.getProperty('db.password')).toBe('real-value');
    });

    test('non-marker values pass through even with a decryptor wired', () => {
        const registry = new SecretSchemeRegistry();
        registry.register(fakeCipher());
        const env = new StandardEnvironment([{ db: { user: 'app', password: 'plain' } }]);
        env.applySecretDecryptor(registry);

        expect(env.getProperty('db.user')).toBe('app');
        expect(env.getProperty('db.password')).toBe('plain');
    });

    test('placeholders resolve BEFORE decryption', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        // The marker is composed through an indirection so placeholder
        // resolution runs first and the cipher sees the RESOLVED marker.
        const env = new StandardEnvironment([{ db: { password: '${secrets.stored}' }, secrets: { stored: marker } }]);
        env.applySecretDecryptor(registry);

        expect(env.getProperty('db.password')).toBe('s3cret-pass');
    });

    test('applySecretDecryptor is idempotent (last decryptor wins)', () => {
        const env = new StandardEnvironment([{ a: 'x' }]);
        env.applySecretDecryptor(new SecretSchemeRegistry());
        // A second application without a decryptor resets to identity.
        env.applySecretDecryptor(new SecretSchemeRegistry());
        expect(env.getProperty('a')).toBe('x');
    });

    test('typed/required reads decrypt before conversion', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);
        const marker = cipher.encrypt('9001', 'server.port');
        const env = new StandardEnvironment([{ server: { port: marker } }]);
        env.applySecretDecryptor(registry);

        expect(env.getRequiredPropertyAs('server.port', Number)).toBe(9001);
    });

    test('secrets survive refresh() (decryptor retained across rebuilds)', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);
        const marker = cipher.encrypt('s3cret', 'db.password');
        const env = new StandardEnvironment([{ db: { password: marker } }]);
        env.applySecretDecryptor(registry);

        env.refresh();
        expect(env.getProperty('db.password')).toBe('s3cret');
    });

    test('marker-shaped values warn once (fail-open) when no decryptor is wired, then pass through (SEC-10)', () => {
        const env = new StandardEnvironment([{ token: '{cipher:v1:abcdef}' }]);
        const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // First lookup: the resolved value matches the secret-marker shape and
        // no decryptor is registered → one-time fail-open warning, and the
        // value still binds as literal plaintext.
        expect(env.getProperty('token')).toBe('{cipher:v1:abcdef}');
        expect(consoleWarn).toHaveBeenCalledTimes(1);
        const warning = consoleWarn.mock.calls[0]?.[0] as string;
        expect(warning).toContain('token'); // names the key, never the value
        expect(warning).not.toContain('cipher:v1:abcdef'); // no ciphertext echo

        // Repeat lookups never warn again (once per process).
        env.getProperty('token');
        env.getProperty('token');
        expect(consoleWarn).toHaveBeenCalledTimes(1);

        consoleWarn.mockRestore();
    });

    test('decrypt-then-convert failure echoes the key but never the plaintext (SEC-11)', () => {
        const registry = new SecretSchemeRegistry();
        const cipher = fakeCipher();
        registry.register(cipher);
        const plaintext = 'not-a-number';
        const marker = cipher.encrypt(plaintext, 'server.port');
        const env = new StandardEnvironment([{ server: { port: marker } }]);
        env.applySecretDecryptor(registry);

        // The marker decrypts to a non-numeric string used as a number — the
        // diagnostic must redact the post-decrypt value: key present, no
        // plaintext (and no raw ciphertext) in the error text.
        try {
            env.getRequiredPropertyAs('server.port', Number);
            throw new Error('expected getRequiredPropertyAs to throw');
        } catch (error) {
            const message = (error as Error).message;
            expect(message).toContain('server.port');
            expect(message).not.toContain(plaintext);
            expect(message).not.toContain(marker);
        }
    });

    test('malformed marker-shaped values do not throw without a decryptor (SEC-10 fail-open, CTX-04)', () => {
        // `{cipher:1:x}` has a non-conforming numeric version segment — the
        // parser rejects it fail-loud, but with NO decryptor wired the read
        // path must stay fail-open: pass the literal value through, no throw.
        const malformed = '{cipher:1:not-a-version}';
        const env = new StandardEnvironment([{ token: malformed }]);
        const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        expect(() => env.getProperty('token')).not.toThrow();
        expect(env.getProperty('token')).toBe(malformed);
        expect(() => env.getRequiredProperty('token')).not.toThrow();
        expect(env.getRequiredProperty('token')).toBe(malformed);

        consoleWarn.mockRestore();
    });

    test('malformed marker-shaped values still fail loud when a decryptor IS wired (CTX-04 control)', () => {
        const registry = new SecretSchemeRegistry();
        registry.register(fakeCipher());
        const env = new StandardEnvironment([{ token: '{cipher:1:not-a-version}' }]);
        env.applySecretDecryptor(registry);

        expect(() => env.getProperty('token')).toThrow(/Malformed secret marker/);
    });
});
