/**
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import {
    InMemoryPendingAuthorizationStore,
    OIDCAdapter,
    OIDCError,
    type PendingAuthorization,
    type PendingAuthorizationStore,
} from '../src/oidc-adapter';

/**
 * Unit behavior of the fail-closed OIDC adapter. Full authorization-code
 * flow tests (discovery + token endpoint + signed tokens) live in
 * oidc-flow.spec.ts.
 */

const baseConfig = {
    issuer: 'https://auth.example.com',
    clientId: 'my-client',
    redirectUri: 'https://myapp.com/callback',
    scopes: ['openid', 'profile', 'email'],
    jwksUrl: 'https://auth.example.com/jwks',
};

function forgeToken(payload: Record<string, unknown>): string {
    return [
        Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url'),
        Buffer.from(JSON.stringify(payload)).toString('base64url'),
        'signature',
    ].join('.');
}

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;

describe('OIDCAdapter construction', () => {
    test('throws without a verification source — no claim-only mode', () => {
        expect(() => new OIDCAdapter({ ...baseConfig, jwksUrl: undefined })).toThrowError(OIDCError);
        try {
            new OIDCAdapter({ ...baseConfig, jwksUrl: undefined });
        } catch (error) {
            expect((error as OIDCError).code).toBe('configuration');
        }
    });

    test('accepts explicit tokenValidator as the verification source', () => {
        expect(
            () =>
                new OIDCAdapter({
                    ...baseConfig,
                    jwksUrl: undefined,
                    tokenValidator: async () => true,
                })
        ).not.toThrow();
    });
});

describe('OIDCAdapter.validate', () => {
    test('rejects a structurally malformed token', async () => {
        const adapter = new OIDCAdapter(baseConfig);
        expect(await adapter.validate('not-a-jwt')).toBeNull();
        expect(await adapter.validate('a.b')).toBeNull();
    });

    test('rejects a token with a wrong issuer (forged, pre-signature claim check)', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, tokenValidator: async () => true });
        expect(
            await adapter.validate(
                forgeToken({ iss: 'https://evil.example.com', aud: 'my-client', sub: '1', exp: futureExp() })
            )
        ).toBeNull();
    });

    test('rejects a token with a wrong audience', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, tokenValidator: async () => true });
        expect(
            await adapter.validate(
                forgeToken({ iss: baseConfig.issuer, aud: 'other-client', sub: '1', exp: futureExp() })
            )
        ).toBeNull();
    });

    test('rejects an expired token', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, tokenValidator: async () => true });
        expect(
            await adapter.validate(
                forgeToken({ iss: baseConfig.issuer, aud: 'my-client', sub: '1', exp: futureExp() - 7200 })
            )
        ).toBeNull();
    });

    test('rejects when the explicit validator rejects the signature', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, jwksUrl: undefined, tokenValidator: async () => false });
        expect(
            await adapter.validate(forgeToken({ iss: baseConfig.issuer, aud: 'my-client', sub: '1', exp: futureExp() }))
        ).toBeNull();
    });

    test('accepts a valid token with matching claims and validator approval', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, jwksUrl: undefined, tokenValidator: async () => true });
        const principal = await adapter.validate(
            forgeToken({
                iss: baseConfig.issuer,
                aud: 'my-client',
                sub: '42',
                name: 'Jane',
                roles: ['admin'],
                exp: futureExp(),
            })
        );
        expect(principal?.id).toBe('42');
        expect(principal?.name).toBe('Jane');
        expect(principal?.hasRole('admin')).toBe(true);
        expect(principal?.hasRole('nobody')).toBe(false);
    });

    test('rejects a token with no sub claim', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, tokenValidator: async () => true });
        expect(
            await adapter.validate(forgeToken({ iss: baseConfig.issuer, aud: 'my-client', exp: futureExp() }))
        ).toBeNull();
    });

    test('rejects a token with an empty sub claim', async () => {
        const adapter = new OIDCAdapter({ ...baseConfig, tokenValidator: async () => true });
        expect(
            await adapter.validate(forgeToken({ iss: baseConfig.issuer, aud: 'my-client', sub: '', exp: futureExp() }))
        ).toBeNull();
    });
});

describe('OIDCAdapter exchangeCodeForTokens state handling', () => {
    test('rejects an unknown state without contacting the token endpoint', async () => {
        const adapter = new OIDCAdapter(baseConfig);
        let fetchCalled = false;
        globalThis.fetch = (async () => {
            fetchCalled = true;
            throw new Error('token endpoint must not be reached');
        }) as typeof fetch;

        await expect(adapter.exchangeCodeForTokens('code', 'forged-state')).rejects.toMatchObject({
            code: 'invalid_state',
        });
        expect(fetchCalled).toBe(false);
    });

    test('state is single-use: replaying the same state fails', async () => {
        // Loopback discard-port issuer: the token-endpoint fetch fails fast
        // with a wrapped network error once the state is accepted.
        const adapter = new OIDCAdapter({
            issuer: 'http://127.0.0.1:9',
            clientId: 'my-client',
            redirectUri: 'https://myapp.com/callback',
            tokenValidator: async () => true,
        });
        const request = await adapter.createAuthorizationRequest();
        await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
            code: 'network', // reaches the (unreachable) token endpoint — state was accepted once
        });
        await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
            code: 'invalid_state', // replay is rejected outright
        });
    });

    test('stale (expired) state is rejected', async () => {
        const adapter = new OIDCAdapter({
            issuer: 'http://127.0.0.1:9',
            clientId: 'my-client',
            redirectUri: 'https://myapp.com/callback',
            tokenValidator: async () => true,
            authorizationTtlMs: -1,
        });
        const request = await adapter.createAuthorizationRequest();
        await expect(adapter.exchangeCodeForTokens('code', request.state)).rejects.toMatchObject({
            code: 'invalid_state',
        });
    });

    test('an expired entry in a configured store is rejected and purged', async () => {
        const entries = new Map<string, PendingAuthorization>();
        const pendingStore: PendingAuthorizationStore = {
            kind: 'test',
            get: async (state) => entries.get(state) ?? null,
            set: async (state, pending) => {
                entries.set(state, pending);
            },
            delete: async (state) => {
                entries.delete(state);
            },
        };
        const adapter = new OIDCAdapter({ ...baseConfig, pendingStore });
        await pendingStore.set('stale-state', {
            state: 'stale-state',
            nonce: 'stale-nonce',
            codeVerifier: 'stale-verifier',
            expiresAt: Date.now() - 1,
        });

        await expect(adapter.exchangeCodeForTokens('code', 'stale-state')).rejects.toMatchObject({
            code: 'invalid_state',
        });
        expect(entries.has('stale-state')).toBe(false);
    });
});

describe('OIDCAdapter.createAuthorizationRequest', () => {
    test('embeds state, nonce, and S256 PKCE parameters in the URL', async () => {
        const adapter = new OIDCAdapter(baseConfig);
        const request = await adapter.createAuthorizationRequest();
        const url = new URL(request.url);
        expect(url.origin + url.pathname).toBe('https://auth.example.com/authorize');
        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('client_id')).toBe('my-client');
        expect(url.searchParams.get('state')).toBe(request.state);
        expect(url.searchParams.get('nonce')).toBe(request.nonce);
        expect(url.searchParams.get('code_challenge_method')).toBe('S256');
        expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    });

    test('code_verifier hashes to the embedded code_challenge (S256)', async () => {
        const adapter = new OIDCAdapter(baseConfig);
        const request = await adapter.createAuthorizationRequest();
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(request.codeVerifier));
        const challenge = Buffer.from(digest).toString('base64url');
        const url = new URL(request.url);
        expect(url.searchParams.get('code_challenge')).toBe(challenge);
    });

    test('carries the configured prompt parameter, and only then', async () => {
        const withPrompt = new OIDCAdapter({ ...baseConfig, prompt: 'consent' });
        const withoutPrompt = new OIDCAdapter(baseConfig);
        const promptUrl = new URL((await withPrompt.createAuthorizationRequest()).url);
        const plainUrl = new URL((await withoutPrompt.createAuthorizationRequest()).url);
        expect(promptUrl.searchParams.get('prompt')).toBe('consent');
        expect(plainUrl.searchParams.get('prompt')).toBeNull();
    });
});

describe('InMemoryPendingAuthorizationStore', () => {
    const entry = (state: string): PendingAuthorization => ({
        state,
        nonce: `nonce-${state}`,
        codeVerifier: `verifier-${state}`,
        expiresAt: Date.now() + 60_000,
    });

    test('round-trips entries and deletes idempotently', async () => {
        const store = new InMemoryPendingAuthorizationStore();
        await store.set('state-1', entry('state-1'));
        expect(await store.get('state-1')).toMatchObject({ state: 'state-1', nonce: 'nonce-state-1' });
        expect(await store.get('unknown')).toBeNull();
        await store.delete('state-1');
        expect(await store.get('state-1')).toBeNull();
        await store.delete('state-1'); // unknown keys are a no-op
    });

    test('bounds storage at the pending cap by evicting the oldest entry', async () => {
        const store = new InMemoryPendingAuthorizationStore();
        for (let i = 0; i <= 20; i++) {
            // oxlint-disable-next-line no-await-in-loop -- insertion order defines which entry is evicted as the oldest.
            await store.set(`state-${i}`, entry(`state-${i}`));
        }
        expect(await store.get('state-0')).toBeNull(); // the 21st set evicted the oldest
        expect(await store.get('state-20')).toMatchObject({ state: 'state-20' });
    });
});

describe('OIDCAdapter refresh guard', () => {
    test('rejects a token the adapter never captured, before any network call', async () => {
        const adapter = new OIDCAdapter(baseConfig);

        await expect(adapter.refresh('never-issued')).rejects.toMatchObject({ code: 'invalid_token' });
    });
});
