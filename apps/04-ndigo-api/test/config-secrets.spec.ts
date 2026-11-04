/**
 * At-rest secrets demo gate (AD-29 Wave 2, SEC-4): with NDIGO_SECRET_KEY set
 * and a `{cipher:...}` value in the property source, the bound
 * `@configurationProperties` instance carries the plaintext and the
 * `/api/config/secrets` endpoint serves it — gated behind the app's
 * Bearer-token demo auth, so the plaintext is never revealed to an
 * unauthenticated caller. Also proves the two-channel posture: without the
 * key the raw marker binds (no false plaintext).
 * @module ndigo-api
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { randomBytes } from 'node:crypto';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { AESGCMCipher, NodeAutoConfiguration } from '@ndigo/platform-node';
import { MockHTTP } from '@ndigo/test';
import type { NodeDispatcher } from '@ndigo/platform-node';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig, SecretsConfig } from '../src/server-config';
import { initAuth } from '../src/auth-store';

const KEY_B64 = Buffer.from(randomBytes(32)).toString('base64');
const cipher = new AESGCMCipher(KEY_B64);
const TOKEN_MARKER = cipher.encrypt('demo-secret-token', 'api.secretToken');

describe('ndigo-api config-secrets demo (AD-29 Wave 2, SEC-4 gated)', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let mockHTTP: MockHTTP;

    beforeAll(async () => {
        initAuth();
        context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            ServerConfig,
            SecretsConfig,
            NodeAppConfiguration,
        ])
            .profiles('dev')
            .properties({ 'server.port': '3011', 'api.secretToken': TOKEN_MARKER })
            .secrets(cipher)
            .run();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        mockHTTP = new MockHTTP({ dispatcher });
    });

    afterAll(() => {
        context.close();
    });

    test('bound SecretsConfig carries the decrypted plaintext', () => {
        const secrets = context.getValue<SecretsConfig>('secretsConfig');
        expect(secrets.secretToken).toBe('demo-secret-token');
    });

    test('GET /api/config/secrets without a token is rejected (SEC-4)', async () => {
        const res = await mockHTTP.get('/api/config/secrets').exec();

        expect(res.response.status).toBe(401);
        // The plaintext must never leak to an unauthenticated caller.
        expect(res.text()).not.toContain('demo-secret-token');
        // Handler-returned errors wrap to an about:blank problem document.
        expect(res.json()).toMatchObject({ title: 'Unauthorized', status: 401, instance: '/api/config/secrets' });
    });

    test('GET /api/config/secrets with the demo token serves the decrypted value', async () => {
        // Acquire a valid demo token through the app's own login endpoint.
        const login = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        const { token } = login.json() as { token?: string };
        expect(token).toBeDefined();

        const res = await mockHTTP
            .get('/api/config/secrets')
            .headers({ authorization: `Bearer ${token}` })
            .exec();

        expect(res.response.status).toBe(200);
        expect((res.json() as { secretToken?: string }).secretToken).toBe('demo-secret-token');
    });

    test('GET /api/config/secrets rejects an unknown bearer token (SEC-4)', async () => {
        const res = await mockHTTP
            .get('/api/config/secrets')
            .headers({ authorization: 'Bearer not-a-real-token' })
            .exec();

        expect(res.response.status).toBe(401);
        expect(res.text()).not.toContain('demo-secret-token');
    });

    test('raw marker (no secrets wiring) binds without false plaintext', async () => {
        initAuth();
        const plain = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            ServerConfig,
            SecretsConfig,
            NodeAppConfiguration,
        ])
            .profiles('dev')
            .properties({ 'server.port': '3012', 'api.secretToken': TOKEN_MARKER })
            .run();

        const secrets = plain.getValue<SecretsConfig>('secretsConfig');
        // No cipher wired → the marker binds raw; boot still succeeds
        // (the two-channel posture is deployer-driven, not enforced).
        expect(secrets.secretToken).toBe(TOKEN_MARKER);
        plain.close();
    });
});

// Guard: the cipher used above and the key are session-local to the spec.
