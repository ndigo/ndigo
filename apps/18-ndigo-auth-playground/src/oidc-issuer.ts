/**
 * The embedded OIDC issuer (mode 6): a real authorization server running inside
 * the playground process, so the authorization-code + PKCE flow can be walked
 * end to end with no container, no Docker and no external service.
 *
 * It is `oidc-provider` (npm, a **dev dependency** — the playground is the only
 * consumer) hosted on its own loopback `node:http` listener. Keeping it on a
 * separate port is deliberate: the playground server is Ndigo's managed
 * `HTTPServer` with a fixed dispatch pipeline, and mounting a third-party Koa
 * application inside it would mean a raw-middleware escape hatch the framework
 * does not have. Two loopback listeners in one process is the honest shape of
 * "an IdP you can run locally" — the client code (mode 6's `/oidc/*` routes)
 * cannot tell the difference, because it only ever speaks discovery + HTTP to
 * `config.oidc.issuerUrl`.
 *
 * The demo previews **dev interactions**: `oidc-provider`'s built-in
 * `devInteractions` feature renders the login/consent pages and accepts any
 * `login` value, which is exactly wrong for production and exactly right for a
 * playground (the README shows the two POSTs that complete the flow). The
 * provider also holds grants in its in-memory adapter and prints the
 * corresponding startup warnings; both are deliberate for an ephemeral demo.
 */
import { createServer, type Server } from 'node:http';
import { Provider } from 'oidc-provider';
import { exportJWK, generateKeyPair } from 'jose';
import { randomToken } from '@ndigo/util';
import { FEDERATED_ROLES, type PlaygroundConfig } from './config';

/** `kid` of the issuer's RS256 signing key (advertised through the JWKS). */
const SIGNING_KEY_ID = 'ndigo-auth-playground-issuer';

/** The demo subject's display name, as it appears in the ID token. */
const FEDERATED_NAME = 'OIDC Demo User';

/** A running embedded issuer. */
export interface EmbeddedIssuer {
    /** The issuer identifier — identical to the discovery document's `issuer`. */
    readonly url: string;
    /** The loopback port it listens on. */
    readonly port: number;
    /** Stops the listener (the provider itself holds no open resources). */
    stop(): Promise<void>;
}

/**
 * Starts the embedded issuer.
 *
 * The RS256 key pair is generated at startup, so the issuer's signing keys do
 * not survive a restart — acceptable and even instructive here (tokens minted
 * before a restart stop verifying, the same way a real IdP's rotation would
 * invalidate them).
 *
 * @param config - The resolved configuration (issuer URL/port, client id, redirect URI).
 * @returns The running issuer.
 * @throws When the issuer's port is already in use.
 */
export async function startEmbeddedIssuer(config: PlaygroundConfig): Promise<EmbeddedIssuer> {
    const { privateKey } = await generateKeyPair('RS256', { extractable: true });
    const signingKey = { ...(await exportJWK(privateKey)), use: 'sig', alg: 'RS256', kid: SIGNING_KEY_ID };

    const provider = new Provider(config.oidc.issuerUrl, {
        // The issuer's own JWKS: one RS256 signing key. The playground's
        // OIDCAdapter verifies ID tokens against these keys via `jwks_uri`.
        jwks: { keys: [signingKey] },
        // Cookie signing keys for the provider's own session/interaction cookies.
        cookies: { keys: [randomToken(32)] },
        clients: [
            {
                // A public client: no secret, PKCE required (the adapter always
                // sends an S256 challenge — see `OIDCAdapter.createAuthorizationRequest`).
                // `refresh_token` is allowed so `/oidc/callback`'s exchange can
                // capture one (the flow requests `offline_access`); the
                // provider's default policy rotates it on every use for public
                // clients, which is exactly the rotation the adapter tracks.
                client_id: config.oidc.clientId,
                redirect_uris: [config.oidc.redirectUri],
                token_endpoint_auth_method: 'none',
                grant_types: ['authorization_code', 'refresh_token'],
                response_types: ['code'],
            },
        ],
        // Only these claims ride the ID token (the provider's default
        // `conformIdTokenClaims` keeps non-`openid` scope claims out of it), so
        // the name and the roles the adapter maps onto its principal must be
        // listed under `openid`.
        claims: {
            openid: ['sub', 'name', 'preferred_username', 'roles'],
            profile: ['name', 'preferred_username'],
        },
        features: { devInteractions: { enabled: true } },
        // One account, looked up by the `login` value the dev-interaction form
        // submits. Unknown subjects are refused, so the issuer cannot mint a
        // token for an account the playground's user store does not have.
        findAccount: async (_ctx: unknown, id: string) => {
            if (id !== config.oidc.accountId) {
                return undefined;
            }
            return {
                accountId: id,
                async claims() {
                    return {
                        sub: id,
                        name: FEDERATED_NAME,
                        preferred_username: id,
                        roles: [...FEDERATED_ROLES],
                    };
                },
            };
        },
    });

    const server: Server = createServer(provider.callback());
    await new Promise<void>((resolve, reject) => {
        server.once('error', reject);
        server.listen(config.oidc.issuerPort, '127.0.0.1', () => {
            server.off('error', reject);
            resolve();
        });
    });

    return {
        url: config.oidc.issuerUrl,
        port: config.oidc.issuerPort,
        stop: async () => {
            await new Promise<void>((resolve) => {
                server.close(() => resolve());
            });
        },
    };
}
