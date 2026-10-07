/**
 * Mode 6 — OIDC authorization-code + PKCE, driven by `@blue/auth-client`'s
 * `OIDCAdapter` against the issuer embedded in this process
 * ({@link startEmbeddedIssuer}).
 *
 * The two routes are the client half of the flow, and they are the whole client:
 *
 * 1. `GET /oidc/start` — `createAuthorizationRequest()` mints `state`, a `nonce`
 *    and a PKCE S256 verifier, keeps them in the adapter's pending store, and
 *    the route answers `302` to the provider's `authorization_endpoint`
 *    (resolved from discovery, whose `issuer` must match exactly).
 * 2. `GET /oidc/callback` — `exchangeCodeForTokens(code, state)` redeems the
 *    single-use `state`, POSTs the code + verifier to the token endpoint, and
 *    verifies the ID token's **signature (JWKS), issuer, audience, expiry and
 *    nonce** before a principal exists. Only then does the playground issue its
 *    own opaque session for that principal — the federated identity lands in the
 *    same durable store, the same cookie and the same `/auth/me` as mode 1.
 *
 * Failures are fail-closed and labelled: an unknown/replayed `state`, a
 * mismatched nonce, a bad signature and a missing `code` are distinct problems
 * (`oidc_state_invalid`, `oidc_exchange_failed`, `oidc_missing_code`), and a
 * federated subject with no application account cannot obtain a session
 * (`oidc_account_unknown`) even though its ID token verified.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, headerValue, parameters, queryValue, requestMapping, routeValue } from '@blue/dispatcher';
import { OIDCAdapter, OIDCError } from '@blue/auth-client';
import { HTTPHeaders, ResponseStatuses } from '@blue/http';
import { ResponseEntity, setSessionCookie, type ProblemDetails, type SessionCookieOptions } from '@blue/platform-node';
import type { Route } from '@blue/router';
import { sessionCookieOptions } from './config';
import type { PlaygroundConfig } from './config';
import { cookieView, MODES, principalView, sessionView } from './api-shape';
import type { AuthStack } from './auth-stack';

/** The `type` of every OIDC problem document from this app. */
const OIDC_PROBLEM_TYPE = 'urn:blue-auth-playground:oidc';

/** Distinguishable OIDC failure codes. */
export type OidcFailureCode =
    | 'oidc_disabled'
    | 'oidc_missing_code'
    | 'oidc_state_invalid'
    | 'oidc_exchange_failed'
    | 'oidc_account_unknown'
    | 'oidc_provider_unreachable';

/** An OIDC problem document, carrying its machine-readable `code`. */
export interface OidcProblem extends ProblemDetails {
    readonly code: OidcFailureCode;
}

/** The mode's failure vocabulary in one static table. */
export const OIDC_FAILURES: Record<OidcFailureCode, OidcProblem> = {
    oidc_disabled: {
        type: OIDC_PROBLEM_TYPE,
        title: 'Service Unavailable',
        status: 503,
        code: 'oidc_disabled',
        detail: 'The embedded issuer is disabled — start the playground with OIDC_ENABLED=true (the default)',
    },
    oidc_missing_code: {
        type: OIDC_PROBLEM_TYPE,
        title: 'Bad Request',
        status: 400,
        code: 'oidc_missing_code',
        detail: 'The callback needs both `code` and `state` from the authorization response',
    },
    oidc_state_invalid: {
        type: OIDC_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'oidc_state_invalid',
        detail: 'Unknown, expired or already-redeemed `state` — start a new flow at GET /oidc/start',
    },
    oidc_exchange_failed: {
        type: OIDC_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'oidc_exchange_failed',
        detail: 'The token exchange or ID-token verification failed (signature, issuer, audience, expiry or nonce)',
    },
    oidc_account_unknown: {
        type: OIDC_PROBLEM_TYPE,
        title: 'Forbidden',
        status: 403,
        code: 'oidc_account_unknown',
        detail: 'The ID token verified, but its subject has no enabled account here — no session was issued',
    },
    oidc_provider_unreachable: {
        type: OIDC_PROBLEM_TYPE,
        title: 'Service Unavailable',
        status: 503,
        code: 'oidc_provider_unreachable',
        detail: 'The provider did not answer its discovery document — check OIDC_ISSUER_URL (the embedded issuer is started by the app)',
    },
};

/**
 * The client half of the OIDC flow: start the redirect, redeem the callback.
 */
@requestMapping('/oidc')
export class OidcController {
    readonly #stack: AuthStack;
    readonly #config: PlaygroundConfig;
    readonly #cookie: SessionCookieOptions;
    readonly #adapter: OIDCAdapter | null;

    /**
     * @param stack - The auth stack (the session store the federated login lands in).
     * @param config - The resolved configuration (issuer, client id, redirect URI).
     */
    constructor(stack: AuthStack, config: PlaygroundConfig) {
        this.#stack = stack;
        this.#config = config;
        this.#cookie = sessionCookieOptions(config);
        this.#adapter = config.oidc.enabled
            ? new OIDCAdapter({
                  issuer: config.oidc.issuerUrl,
                  clientId: config.oidc.clientId,
                  redirectUri: config.oidc.redirectUri,
                  scopes: ['openid', 'profile'],
                  // Discovery resolves authorization/token/JWKS endpoints and
                  // refuses a document whose `issuer` is not this exact value.
                  discovery: true,
                  // In-memory pending store (the adapter default) is correct here:
                  // one process both creates and redeems the request. A
                  // multi-instance deployment injects a shared store instead.
              })
            : null;
    }

    /**
     * `GET /oidc/start` — begins the flow.
     *
     * @returns A `302` to the provider's authorization endpoint, or `503` when
     *   the embedded issuer is disabled.
     */
    @getMapping('/start')
    async start() {
        if (this.#adapter === null) {
            return new ResponseEntity(OIDC_FAILURES.oidc_disabled, ResponseStatuses.SERVICE_UNAVAILABLE);
        }
        let request;
        try {
            // `createAuthorizationRequest` resolves discovery first, so an
            // unreachable provider fails here rather than at the callback — and
            // it fails as a labelled 503, not as an internal error.
            request = await this.#adapter.createAuthorizationRequest();
        } catch {
            return new ResponseEntity(OIDC_FAILURES.oidc_provider_unreachable, ResponseStatuses.SERVICE_UNAVAILABLE);
        }
        return new ResponseEntity(undefined, ResponseStatuses.FOUND, {
            [HTTPHeaders.LOCATION.name]: request.url,
        });
    }

    /**
     * `GET /oidc/callback` — redeems the authorization code.
     *
     * A browser navigation gets a `302` back into the playground UI (which then
     * shows the session it obtained); a client that asks for JSON
     * (`Accept: application/json`) gets the summary body instead, which is how
     * the tests and the README transcript drive it.
     *
     * @param code - The authorization code from the provider.
     * @param state - The CSRF correlation value minted by `/oidc/start`.
     * @param accept - The raw `Accept` header (JSON vs browser rendering).
     * @param route - The route (the session cookie is written to its response).
     * @returns The session summary, a `302` to the UI, or a labelled failure.
     */
    @getMapping('/callback')
    @parameters({
        code: queryValue('code'),
        state: queryValue('state'),
        accept: headerValue('accept'),
        route: routeValue(),
    })
    async callback(code: string | null, state: string | null, accept: string | null, route: Route) {
        if (this.#adapter === null) {
            return new ResponseEntity(OIDC_FAILURES.oidc_disabled, ResponseStatuses.SERVICE_UNAVAILABLE);
        }
        // Extractors bind `null` for a value the request does not carry.
        if (typeof code !== 'string' || code === '' || typeof state !== 'string' || state === '') {
            return new ResponseEntity(OIDC_FAILURES.oidc_missing_code, ResponseStatuses.BAD_REQUEST);
        }

        let result;
        try {
            result = await this.#adapter.exchangeCodeForTokens(code, state);
        } catch (error) {
            const stateInvalid = error instanceof OIDCError && error.code === 'invalid_state';
            const problem = stateInvalid ? OIDC_FAILURES.oidc_state_invalid : OIDC_FAILURES.oidc_exchange_failed;
            const detail = error instanceof OIDCError ? `${error.code}: ${error.message}` : problem.detail;
            return new ResponseEntity({ ...problem, detail }, ResponseStatuses.UNAUTHORIZED);
        }
        if (result.principal === null) {
            return new ResponseEntity(OIDC_FAILURES.oidc_exchange_failed, ResponseStatuses.UNAUTHORIZED);
        }

        let session;
        try {
            // Fail closed: the federated subject must map to an enabled account.
            session = await this.#stack.issueSession(result.principal);
        } catch {
            return new ResponseEntity(OIDC_FAILURES.oidc_account_unknown, ResponseStatuses.FORBIDDEN);
        }
        setSessionCookie(route, session.token, this.#cookie);

        const summary = {
            mode: MODES.oidc,
            surface: 'http',
            provider: this.#config.oidc.issuerUrl,
            clientId: this.#config.oidc.clientId,
            pkce: 'S256',
            principal: principalView(result.principal),
            session: sessionView(this.#config, session),
            cookie: cookieView(this.#config),
            follows: 'GET /auth/me now answers with this session cookie',
        };
        if (typeof accept === 'string' && accept.includes('application/json')) {
            return summary;
        }
        // A browser landed here: send it back to the UI with the outcome flag.
        return new ResponseEntity(undefined, ResponseStatuses.SEE_OTHER, {
            [HTTPHeaders.LOCATION.name]: '/?mode=oidc',
        });
    }
}
