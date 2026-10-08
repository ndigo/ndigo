/**
 * The `@blue/http` client this app drives the Conduit API with, plus the two
 * interceptors that carry the RealWorld session: an outgoing `Authorization:
 * Token <jwt>` stamp and the global `401` circuit-breaker.
 *
 * Everything the app sends goes through one `HTTP` instance configured here, so
 * the auth header and the unauthorized reaction cannot be forgotten by a single
 * call site — the requirement is a property of the client, not of the caller.
 *
 * Requests use origin-absolute paths (`/api/…`). In dev the Vite proxy
 * (`vite.config.ts`) forwards `/api` to the local API, so the browser is
 * same-origin with it and the JWT never crosses an origin boundary; in a build
 * the same paths are correct wherever a reverse proxy fronts the app.
 *
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTP, type Fetch, type HTTPInit, type RequestAwareHTTPInterceptor, type ResponseAwareHTTPInterceptor } from '@blue/http';

/** The header the RealWorld API reads the JWT from. */
export const AUTHORIZATION_HEADER = 'Authorization';

/** The RealWorld token scheme prefix (`Authorization: Token <jwt>`). */
export const TOKEN_SCHEME = 'Token';

/**
 * Options for {@link createConduitHttp}.
 */
export interface ConduitHttpOptions {
    /** Reads the current JWT; `null` when the visitor is anonymous. */
    getToken: () => string | null;
    /** Invoked once per `401` response, before it reaches the caller. */
    onUnauthorized: () => void;
    /** Custom Fetch implementation (tests); defaults to `globalThis.fetch`. */
    fetch?: Fetch;
}

/**
 * Stamps every outgoing request with the session's `Token <jwt>` credential.
 *
 * Reads the token at request time (never cached), so a login/logout is
 * reflected by the very next call.
 */
export class AuthTokenInterceptor implements RequestAwareHTTPInterceptor {
    readonly #getToken: () => string | null;

    /**
     * Creates the interceptor.
     *
     * @param getToken - Reads the current JWT.
     */
    constructor(getToken: () => string | null) {
        this.#getToken = getToken;
    }

    /** @inheritdoc */
    async preRequest(request: Request): Promise<Request> {
        const token = this.#getToken();
        if (!token) {
            return request;
        }

        const headers = new Headers(request.headers);
        headers.set(AUTHORIZATION_HEADER, `${TOKEN_SCHEME} ${token}`);
        return new Request(request, { headers });
    }
}

/**
 * Reacts to a `401` from *any* call: the stored credential is no longer usable,
 * so the session is dropped and the visitor is sent back to the login page.
 *
 * The response is handed through unchanged — this interceptor observes, it does
 * not rewrite — so the caller still receives the RealWorld error envelope and
 * can surface it per field. A `401` from the login endpoint lands on the login
 * page the visitor is already looking at, where writing the same hash is a
 * no-op, so the credential error still renders in the form.
 */
export class UnauthorizedInterceptor implements ResponseAwareHTTPInterceptor {
    readonly #onUnauthorized: () => void;

    /**
     * Creates the interceptor.
     *
     * @param onUnauthorized - Invoked for each `401` response.
     */
    constructor(onUnauthorized: () => void) {
        this.#onUnauthorized = onUnauthorized;
    }

    /** @inheritdoc */
    async postResponse(response: Response): Promise<void> {
        if (response.status === 401) {
            this.#onUnauthorized();
        }
    }
}

/**
 * Builds the app's HTTP client.
 *
 * @param options - Token accessor, unauthorized hook, and optional Fetch.
 * @returns A configured {@link HTTP} instance.
 */
export function createConduitHttp(options: ConduitHttpOptions): HTTP {
    return HTTP.create({
        headers: { 'Content-Type': 'application/json' },
        interceptors: [new AuthTokenInterceptor(options.getToken), new UnauthorizedInterceptor(options.onUnauthorized)],
        ...(options.fetch ? { fetch: options.fetch } : {}),
    });
}

/**
 * Renders a query string from the members that are actually present.
 *
 * Members that are absent, `null`, or empty are dropped rather than serialized
 * as `key=undefined` — the API's Zod query contract rejects both.
 *
 * @param query - The query members (any flat record, e.g. a filter interface).
 * @returns `?a=1&b=2`, or `''` when nothing is present.
 */
export function buildQuery(query: Record<string, unknown>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (typeof value !== 'string' && typeof value !== 'number') {
            continue;
        }
        if (value === '') {
            continue;
        }
        params.set(key, String(value));
    }
    const rendered = params.toString();
    return rendered.length > 0 ? `?${rendered}` : '';
}

/** The request init shape {@link HTTP.request} accepts, kept narrow for the client. */
export type ConduitRequestInit = Omit<HTTPInit, 'method' | 'baseURL' | 'params'>;
