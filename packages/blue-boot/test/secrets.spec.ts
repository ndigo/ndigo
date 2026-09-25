/**
 * Boot-level secrets integration (AD-29 Wave 2, D-5): `builder.secrets(...)`
 * wires a cipher so `{cipher:...}` markers in properties resolve to
 * plaintext in `@configurationProperties` binding.
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { ApplicationBuilder, configurationProperties } from '../src/index';
import { property, defaultValue, configuration, SecretCipher } from '@blue/context';

@configurationProperties('db')
class DbConfig {
    @property('password', String) @defaultValue('none') password!: string;
    @property('user', String) @defaultValue('app') user!: string;
}

/** Minimal AES-GCM-free fake that round-trips through the real wire format. */
const fakeCipher = (): SecretCipher => {
    // Deterministic "encryption" via simple XOR with a fixed pad; AAD bound in.
    const pad = (s: string): string => {
        const bytes = Buffer.from(s, 'utf8');
        const key = Buffer.from('blue-secrets-pad', 'utf8');
        const out = Buffer.alloc(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            out[i] = bytes[i] ^ key[i % key.length];
        }
        return out.toString('base64url');
    };
    const unpad = (s: string): string => {
        const out = Buffer.from(s, 'base64url');
        const key = Buffer.from('blue-secrets-pad', 'utf8');
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
});
