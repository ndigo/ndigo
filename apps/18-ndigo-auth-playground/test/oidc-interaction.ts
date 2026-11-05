/**
 * Test-only driver for the OIDC authorization-code + PKCE flow against the
 * **embedded issuer**.
 *
 * It plays the end user's browser: it starts the flow at the playground's own
 * `/oidc/start` (so the app — not this driver — owns `state`, the `nonce` and the
 * PKCE verifier), follows the provider's redirects with a cookie jar, answers
 * the `devInteractions` login and consent forms, and returns the callback URL
 * the provider finally redirected to. The spec then hands that URL back to the
 * app, so the verifier, the nonce and the `state` round-trip are all resolved by
 * the real `OIDCAdapter` against the real issuer.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/** The validated subset of the provider's discovery document this driver reads. */
export interface DiscoveryEndpoints {
    readonly issuer: string;
    readonly authorizationEndpoint: string;
    readonly tokenEndpoint: string;
    readonly jwksUri: string;
}

/** Everything the caller needs to redeem the authorization code. */
export interface AuthorizationFlowResult {
    /** The provider's redirect to the client's `redirect_uri`, with `code` and `state`. */
    readonly callbackUrl: string;
    /** The authorization code the provider issued. */
    readonly code: string;
    /** The `state` the app minted (and is waiting to redeem). */
    readonly state: string;
}

/** Driver options: where to start, and which demo subject to sign in as. */
export interface FlowOptions {
    /** The app's `/oidc/start` URL (it answers `302` to the provider). */
    readonly startUrl: string;
    /** The issuer identifier (for resolving the provider's relative URLs). */
    readonly issuerUrl: string;
    /** The client's `redirect_uri`, i.e. where the flow must land. */
    readonly redirectUri: string;
    /** The `login` value the dev-interaction form submits (the account id). */
    readonly accountId: string;
}

/**
 * Fetches the issuer's discovery document.
 *
 * @param issuerUrl - The issuer identifier.
 * @returns The endpoints the flow needs.
 */
export async function discover(issuerUrl: string): Promise<DiscoveryEndpoints> {
    const res = await fetch(`${issuerUrl}/.well-known/openid-configuration`);
    if (!res.ok) {
        throw new Error(`discovery failed with ${res.status}`);
    }
    const document = (await res.json()) as Record<string, unknown>;
    const issuer = document['issuer'];
    const authorizationEndpoint = document['authorization_endpoint'];
    const tokenEndpoint = document['token_endpoint'];
    const jwksUri = document['jwks_uri'];
    if (
        typeof issuer !== 'string' ||
        typeof authorizationEndpoint !== 'string' ||
        typeof tokenEndpoint !== 'string' ||
        typeof jwksUri !== 'string'
    ) {
        throw new Error('discovery document is missing an endpoint');
    }
    return { issuer, authorizationEndpoint, tokenEndpoint, jwksUri };
}

/**
 * Runs the flow from the app's `/oidc/start` up to the client redirect.
 *
 * @param options - The start URL, the issuer and the demo subject.
 * @returns The callback URL, the code and the app's `state`.
 */
export async function runAuthorizationCodeFlow(options: FlowOptions): Promise<AuthorizationFlowResult> {
    // A minimal cookie jar: the provider's own session/interaction cookies must
    // travel with every hop, exactly as a browser would carry them.
    const jar = new Map<string, string>();
    const cookieHeader = (): string => [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
    const step = async (url: string, init: RequestInit = {}): Promise<Response> => {
        const headers = new Headers(init.headers);
        if (jar.size > 0) headers.set('cookie', cookieHeader());
        const res = await fetch(url, { ...init, redirect: 'manual', headers });
        for (const line of res.headers.getSetCookie()) {
            const [pair] = line.split(';');
            const separator = pair.indexOf('=');
            jar.set(pair.slice(0, separator), pair.slice(separator + 1));
        }
        return res;
    };
    /** Follows provider redirects (303 → GET) until the client redirect URI is hit. */
    const follow = async (url: string, init: RequestInit = {}, depth = 0): Promise<Response> => {
        const res = await step(url, init);
        const location = res.headers.get('location');
        if (res.status >= 300 && res.status < 400 && location !== null) {
            if (location.startsWith(options.redirectUri)) return res;
            if (depth > 6) throw new Error('too many redirects in the authorization flow');
            return follow(new URL(location, options.issuerUrl).toString(), {}, depth + 1);
        }
        return res;
    };

    let response = await follow(options.startUrl);
    for (let attempt = 0; attempt < 8; attempt += 1) {
        const location = response.headers.get('location');
        if (location !== null && location.startsWith(options.redirectUri)) {
            const callback = new URL(location);
            if (callback.searchParams.get('error') !== null) {
                throw new Error(`the provider refused the authorization: ${callback.search}`);
            }
            const code = callback.searchParams.get('code');
            const state = callback.searchParams.get('state');
            if (code === null || state === null) throw new Error(`callback carried no code/state: ${location}`);
            return { callbackUrl: location, code, state };
        }
        if (response.status === 200) {
            // A dev-interaction page: answer its form (login, then consent).
            // eslint-disable-next-line no-await-in-loop -- each hop's Set-Cookie must reach the next step of the flow.
            const html = await response.text();
            const uid = /action="[^"]*\/interaction\/([^"]+)"/.exec(html)?.[1];
            const prompt = /name="prompt" value="([^"]+)"/.exec(html)?.[1];
            if (uid === undefined) throw new Error('no dev-interaction form on the page');
            // eslint-disable-next-line no-await-in-loop -- each hop's Set-Cookie must reach the next step of the flow.
            response = await follow(`${options.issuerUrl}/interaction/${uid}`, {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    prompt: prompt ?? 'login',
                    login: options.accountId,
                    password: 'demo',
                }),
            });
        } else {
            if (location === null) throw new Error(`unexpected response ${response.status} with no location`);
            // eslint-disable-next-line no-await-in-loop -- each hop's Set-Cookie must reach the next step of the flow.
            response = await follow(new URL(location, options.issuerUrl).toString());
        }
    }
    throw new Error('the authorization flow did not reach the client redirect');
}
