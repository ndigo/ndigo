/**
 * Boot-level secrets integration (AD-29 Wave 2, D-5): `builder.secrets(...)`
 * wires a cipher so `{cipher:...}` markers in properties resolve to
 * plaintext in `@configurationProperties` binding.
 * @module ndigo-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { ApplicationBuilder, configurationProperties, resolveConfigurationProperties } from '../src/index';
import { property, defaultValue, configuration, SecretCipher, REDACTED_VALUE } from '@ndigo/context';

@configurationProperties('db')
class DbConfig {
    @property('password', String as unknown as new (...args: never[]) => string)
    @defaultValue('none')
    password!: string;
    @property('user', String as unknown as new (...args: never[]) => string) @defaultValue('app') user!: string;
}

/** Minimal AES-GCM-free fake that round-trips through the real wire format. */
const fakeCipher = (): SecretCipher => {
    // Deterministic "encryption" via simple XOR with a fixed pad; AAD bound in.
    const pad = (s: string): string => {
        const bytes = Buffer.from(s, 'utf8');
        const key = Buffer.from('ndigo-secrets-pad', 'utf8');
        const out = Buffer.alloc(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            out[i] = bytes[i] ^ key[i % key.length];
        }
        return out.toString('base64url');
    };
    const unpad = (s: string): string => {
        const out = Buffer.from(s, 'base64url');
        const key = Buffer.from('ndigo-secrets-pad', 'utf8');
        for (let i = 0; i < out.length; i++) {
            out[i] = out[i] ^ key[i % key.length];
        }
        return out.toString('utf8');
    };
    return {
        scheme: 'test',
        capabilities: { aad: true },
        encrypt(plain: string, aad?: string): string {
            return `{test:v1:${pad(`${plain}|${aad ?? ''}`)}}`;
        },
        decrypt(marker: string, aad?: string): string {
            const payload = marker.slice(1, -1).replace(/^test:v1:/, '');
            const [plain, bound] = unpad(payload).split('|');
            if (bound !== (aad ?? '')) throw new Error('AAD mismatch');
            return plain;
        },
    };
};

describe('builder.secrets (AD-29 Wave 2)', () => {
    test('binds decrypted marker values into @configurationProperties classes', async () => {
        const cipher = fakeCipher();
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DbConfig]);
        app.properties({ db: { user: 'app-user', password: marker } });
        app.secrets(cipher);

        const context = await app.run();
        const db = context.getValue<DbConfig>('dbConfig');

        expect(db.password).toBe('s3cret-pass'); // decrypted at bind time
        expect(db.user).toBe('app-user'); // non-marker untouched
    });

    test('without secrets() wiring, markers bind as raw text (no cipher configured)', async () => {
        const cipher = fakeCipher();
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DbConfig]);
        app.properties({ db: { password: marker } });

        const context = await app.run();
        const db = context.getValue<DbConfig>('dbConfig');

        expect(db.password).toBe(marker); // raw marker — no decryptor wired
    });

    test('unknown-scheme markers fail boot loudly (never plaintext fallback)', async () => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DbConfig]);
        app.properties({ db: { user: 'x', password: '{jwe:eyJ…}' } });
        app.secrets(fakeCipher());

        // Config binding reads the property → unknown scheme → boot fails
        // loudly; Application wraps the cause in "startup failed".
        const err = await app.run().then(
            () => null,
            (e: { cause?: { message?: string } }) => e
        );
        expect(err).not.toBeNull();
        expect(err?.cause?.message).toMatch(/unregistered scheme "jwe"/);
    });

    test('decrypted values still satisfy runtime validation', async () => {
        const cipher = fakeCipher();
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DbConfig]);
        app.properties({ db: { password: marker } });
        app.secrets(cipher);

        const context = await app.run();
        const db = context.getValue<DbConfig>('dbConfig');

        expect(db.password.length).toBeGreaterThan(0);
        expect(db.password).toBe('s3cret-pass');
    });

    test('CF-2: conversion failure never echoes the decrypted plaintext in the bind message', async () => {
        @configurationProperties('dbnum')
        class SecretNumberConfig {
            @property('token', Number as unknown as new (...args: never[]) => number) token!: number;
        }
        const cipher = fakeCipher();
        const marker = cipher.encrypt('super-secret-hunter2', 'dbnum.token');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, SecretNumberConfig]);
        app.properties({ dbnum: { token: marker } });
        app.secrets(cipher);

        // The marker decrypts to a non-numeric string, so the Number
        // conversion fails; the wrapped boot error is the leak surface.
        const err = await app.run().then(
            () => null,
            (e: Error & { cause?: Error }) => e
        );
        const messages = `${err?.message ?? ''}\n${err?.cause?.message ?? ''}`;

        expect(err).not.toBeNull();
        expect(messages).toMatch(/Cannot bind SecretNumberConfig\.token from "dbnum\.token"/);
        expect(messages).not.toContain('super-secret-hunter2');
        expect(messages).not.toContain(marker);
    });

    test('SEC-A: bindings holds the redacted placeholder, not decrypted plaintext', async () => {
        const cipher = fakeCipher();
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DbConfig]);
        app.properties({ db: { user: 'app-user', password: marker } });
        app.secrets(cipher);

        const context = await app.run();
        const { instance, bindings } = resolveConfigurationProperties(DbConfig, context);

        expect(instance.password).toBe('s3cret-pass'); // instance binds plaintext
        expect(bindings['db.password']).toBe(REDACTED_VALUE); // map never carries it
        expect(bindings['db.user']).toBe('app-user'); // ordinary values untouched
        expect(JSON.stringify(bindings)).not.toContain('s3cret-pass');
        expect(JSON.stringify(bindings)).not.toContain(marker);
    });

    test('SEC-A: a marker with no decryptor is redacted from bindings too (no ciphertext leaks)', async () => {
        const cipher = fakeCipher();
        const marker = cipher.encrypt('s3cret-pass', 'db.password');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DbConfig]);
        app.properties({ db: { password: marker } });

        const context = await app.run();
        const { bindings } = resolveConfigurationProperties(DbConfig, context);

        expect(bindings['db.password']).toBe(REDACTED_VALUE);
        expect(JSON.stringify(bindings)).not.toContain(marker);
    });
});

describe('secret redaction invariant (CTX-02/CTX-03)', () => {
    test('CTX-02: environment validation never echoes the decrypted plaintext', async () => {
        const cipher = fakeCipher();
        const marker = cipher.encrypt('super-secret-hunter2', 'token');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig]);
        app.properties({ token: marker });
        app.secrets(cipher);
        app.validateWith(z.object({ token: z.number() }));

        // The marker decrypts to a string, the schema wants a number → the
        // aggregate report previously printed `got "super-secret-hunter2"`.
        const err = await app.run().then(
            () => null,
            (e: Error & { cause?: Error }) => e
        );
        const messages = `${err?.message ?? ''}\n${err?.cause?.message ?? ''}`;

        expect(err).not.toBeNull();
        expect(messages).toContain('Environment validation failed');
        expect(messages).toContain('token');
        expect(messages).not.toContain('super-secret-hunter2');
        expect(messages).not.toContain(marker);
    });

    test('CTX-03: Boolean conversion failure never echoes the decrypted plaintext', async () => {
        @configurationProperties('secbool')
        class SecBoolConfig {
            @property('enabled', Boolean as unknown as new (...args: never[]) => boolean) enabled!: boolean;
        }
        const cipher = fakeCipher();
        const marker = cipher.encrypt('super-secret-hunter2', 'secbool.enabled');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, SecBoolConfig]);
        app.properties({ secbool: { enabled: marker } });
        app.secrets(cipher);

        const err = await app.run().then(
            () => null,
            (e: Error & { cause?: Error }) => e
        );
        const messages = `${err?.message ?? ''}\n${err?.cause?.message ?? ''}`;

        expect(err).not.toBeNull();
        expect(messages).toContain('SecBoolConfig.enabled');
        expect(messages).not.toContain('super-secret-hunter2');
        expect(messages).not.toContain(marker);
    });

    test('CTX-03: Date conversion failure never echoes the decrypted plaintext', async () => {
        @configurationProperties('secdate')
        class SecDateConfig {
            @property('at', Date) at!: Date;
        }
        const cipher = fakeCipher();
        const marker = cipher.encrypt('super-secret-hunter2', 'secdate.at');

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, SecDateConfig]);
        app.properties({ secdate: { at: marker } });
        app.secrets(cipher);

        const err = await app.run().then(
            () => null,
            (e: Error & { cause?: Error }) => e
        );
        const messages = `${err?.message ?? ''}\n${err?.cause?.message ?? ''}`;

        expect(err).not.toBeNull();
        expect(messages).toContain('SecDateConfig.at');
        expect(messages).not.toContain('super-secret-hunter2');
        expect(messages).not.toContain(marker);
    });
});
