/**
 * Response-shaping probes: statuses, redirects, response headers, cookies,
 * auth challenges, delays, binary/streamed bodies, compression and the
 * rate-limit demo.
 */
import '@tsmetadata/polyfill';
import { deflateSync, gzipSync } from 'node:zlib';
import {
    cookieValue,
    getMapping,
    headerValue,
    parameters,
    pathVariable,
    queryValue,
    requestMapping,
    routeValue,
} from '@ndigo/dispatcher';
import { HTTPHeaders, ResponseStatus, ResponseStatuses } from '@ndigo/http';
import { ResponseEntity, getNodeRequest, rateLimit } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { type QueryBag } from './httpbin-support';
import { setResponseHeader } from './response-header-seam';

/** Reason phrases for codes absent from `ResponseStatuses` (RFC 9110 §15). */
const STATUS_TEXT: Record<number, string> = {
    418: "I'm a teapot",
    425: 'Too Early',
    451: 'Unavailable For Legal Reasons',
};

/**
 * A deterministic pseudo-random byte string (LCG seeded from a constant) so
 * `/bytes/{n}` returns identical bytes for identical `n` — a reproducible
 * binary payload with no external entropy.
 *
 * @param length - The number of bytes to produce.
 * @returns The byte buffer.
 */
function deterministicBytes(length: number): Buffer {
    const bytes = Buffer.alloc(length);
    let state = 0x1234_5678;
    for (let index = 0; index < length; index++) {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        bytes[index] = state & 0xff;
    }
    return bytes;
}

/**
 * Parses an HTTP Basic `Authorization` value into its credentials.
 *
 * @param authorization - The raw header value.
 * @returns The decoded credentials, or `null` when absent or malformed.
 */
function parseBasicCredentials(authorization: string | undefined): { user: string; password: string } | null {
    if (typeof authorization !== 'string') {
        return null;
    }
    const match = /^Basic\s+(.+)$/i.exec(authorization.trim());
    if (match === null) {
        return null;
    }
    const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
    const separator = decoded.indexOf(':');
    if (separator < 0) {
        return null;
    }
    return { user: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
}

/**
 * Response-shaping probes — the HTTP semantics half of httpbin.
 */
@requestMapping('/')
export class ResponseController {
    /**
     * GET /status/ — the default `200 OK`.
     */
    @getMapping('/status')
    statusDefault() {
        return new ResponseEntity(undefined, ResponseStatuses.OK);
    }

    /**
     * GET /status/{code} — returns the requested status code. An
     * out-of-range or non-numeric code is rejected with `400`.
     */
    @getMapping('/status/:code')
    @parameters({ code: pathVariable('code') })
    status(code: string) {
        const numeric = Number(code);
        if (!Number.isInteger(numeric) || numeric < 100 || numeric > 599) {
            return ResponseEntity.badRequest({ error: 'invalid_status_code', code });
        }
        const status = ResponseStatus.for(numeric, STATUS_TEXT[numeric] ?? 'Status') ?? ResponseStatuses.OK;
        return new ResponseEntity(undefined, status);
    }

    /**
     * GET /redirect/{n} — a `302` chain that decrements `n` and lands on
     * `/get` from `/redirect/1`.
     */
    @getMapping('/redirect/:n')
    @parameters({ n: pathVariable('n') })
    redirect(n: string) {
        const hops = Number(n);
        if (!Number.isInteger(hops) || hops < 1) {
            return ResponseEntity.badRequest({ error: 'invalid_redirect_count', n });
        }
        return this.#redirectTo(hops > 1 ? `/redirect/${hops - 1}` : '/get');
    }

    /**
     * GET /redirect — the base form, redirecting straight to `/get`.
     */
    @getMapping('/redirect')
    redirectBase() {
        return this.#redirectTo('/get');
    }

    /**
     * GET /relative-redirect/{n} — the same chain with a relative `Location`.
     */
    @getMapping('/relative-redirect/:n')
    @parameters({ n: pathVariable('n') })
    relativeRedirect(n: string) {
        const hops = Number(n);
        if (!Number.isInteger(hops) || hops < 1) {
            return ResponseEntity.badRequest({ error: 'invalid_redirect_count', n });
        }
        return this.#redirectTo(hops > 1 ? `/relative-redirect/${hops - 1}` : '/get');
    }

    /**
     * GET /relative-redirect — the base form, redirecting straight to `/get`.
     */
    @getMapping('/relative-redirect')
    relativeRedirectBase() {
        return this.#redirectTo('/get');
    }

    /**
     * GET /redirect-to?url= — a `302` to the caller-supplied URL.
     */
    @getMapping('/redirect-to')
    @parameters({ url: queryValue('url') })
    redirectTo(url?: string) {
        if (!url) {
            return ResponseEntity.badRequest({ error: 'url_required' });
        }
        return this.#redirectTo(url);
    }

    /**
     * GET /response-headers?k=v — sets every query pair as a response header
     * and echoes the same pairs as the JSON body (repeated keys become arrays).
     */
    @getMapping('/response-headers')
    @parameters({ query: queryValue() })
    responseHeaders(query: QueryBag) {
        // NOTE: bridging to Record<string — the source type is wider than this consumer's contract.
        const headers = { ...query } as unknown as Record<string, string>;
        return new ResponseEntity(headers, ResponseStatuses.OK, headers);
    }

    /**
     * GET /cookies — echoes the parsed cookie jar.
     */
    @getMapping('/cookies')
    @parameters({ jar: cookieValue() })
    cookies(jar: Record<string, string>) {
        return { cookies: jar ?? {} };
    }

    /**
     * GET /cookies/set?k=v — a `302` back to `/cookies` with a `Set-Cookie`
     * for every query pair.
     */
    @getMapping('/cookies/set')
    @parameters({ route: routeValue(), query: queryValue() })
    setCookies(route: Route, query: QueryBag) {
        const values = Object.entries(query).map(([name, value]) =>
            HTTPHeaders.SET_COOKIE.buildValue(name, Array.isArray(value) ? value[0] : value, ['Path=/'])
        );
        if (values.length > 0) {
            setResponseHeader(route, HTTPHeaders.SET_COOKIE.name, values.length === 1 ? values[0] : values);
        }
        return this.#redirectTo('/cookies');
    }

    /**
     * GET /cookies/delete?k= — a `302` back to `/cookies` expiring every named
     * cookie.
     */
    @getMapping('/cookies/delete')
    @parameters({ route: routeValue(), query: queryValue() })
    deleteCookies(route: Route, query: QueryBag) {
        const values = Object.keys(query).map((name) =>
            HTTPHeaders.SET_COOKIE.buildValue(name, '', ['Max-Age=0', 'Path=/'])
        );
        if (values.length > 0) {
            setResponseHeader(route, HTTPHeaders.SET_COOKIE.name, values.length === 1 ? values[0] : values);
        }
        return this.#redirectTo('/cookies');
    }

    /**
     * GET /basic-auth/{user}/{passwd} — `401` + `WWW-Authenticate` when the
     * credentials are missing or wrong, `{ authenticated, user }` when right.
     */
    @getMapping('/basic-auth/:user/:passwd')
    @parameters({
        route: routeValue(),
        user: pathVariable('user'),
        passwd: pathVariable('passwd'),
        authorization: headerValue('authorization'),
    })
    basicAuth(route: Route, user: string, passwd: string, authorization?: string) {
        const credentials = parseBasicCredentials(authorization);
        if (credentials === null || credentials.user !== user || credentials.password !== passwd) {
            setResponseHeader(route, HTTPHeaders.WWW_AUTHENTICATE.name, 'Basic realm="ndigo-httpbin"');
            return ResponseEntity.unauthorized();
        }
        return { authenticated: true, user };
    }

    /**
     * GET /bearer — `401` + `WWW-Authenticate: Bearer` without a bearer token,
     * `{ authenticated, token }` with one.
     */
    @getMapping('/bearer')
    @parameters({ route: routeValue(), authorization: headerValue('authorization') })
    bearer(route: Route, authorization?: string) {
        const token = HTTPHeaders.AUTHORIZATION.bearerToken(authorization);
        if (!token) {
            setResponseHeader(route, HTTPHeaders.WWW_AUTHENTICATE.name, 'Bearer');
            return ResponseEntity.unauthorized();
        }
        return { authenticated: true, token };
    }

    /**
     * GET /delay/{n} — waits `n` seconds (clamped to 0–10) before responding.
     * The handler is async, so the wait yields to the event loop and never
     * blocks other in-flight requests.
     */
    @getMapping('/delay/:n')
    @parameters({ n: pathVariable('n') })
    async delay(n: string) {
        const requested = Number(n);
        const seconds = Number.isFinite(requested) ? Math.min(Math.max(requested, 0), 10) : 0;
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(resolve, seconds * 1000);
        await promise;
        return { delay: seconds };
    }

    /**
     * GET /bytes/{n} — `n` deterministic pseudo-random bytes
     * (`application/octet-stream`), capped at 100 000.
     */
    @getMapping('/bytes/:n')
    @parameters({ n: pathVariable('n') })
    bytes(n: string) {
        const requested = Number(n);
        const length = Number.isFinite(requested) ? Math.min(Math.max(Math.trunc(requested), 0), 100_000) : 0;
        return new ResponseEntity(deterministicBytes(length), ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'application/octet-stream',
        });
    }

    /**
     * GET /stream/{n} — `n` newline-delimited JSON records
     * (`application/json`), capped at 100.
     */
    @getMapping('/stream/:n')
    @parameters({ n: pathVariable('n'), route: routeValue() })
    stream(n: string, route: Route) {
        const requested = Number(n);
        const count = Number.isFinite(requested) ? Math.min(Math.max(Math.trunc(requested), 0), 100) : 0;
        const origin = getNodeRequest(route)?.remoteAddress ?? null;
        const lines = Array.from({ length: count }, (_, id) => JSON.stringify({ id, origin }));
        // A `Buffer` body is written raw (a string would be JSON-stringified
        // once more because the content type is `application/json`).
        return new ResponseEntity(Buffer.from(lines.join('\n'), 'utf-8'), ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'application/json; charset=utf-8',
        });
    }

    /**
     * GET /gzip — a gzipped JSON body when the client accepts `gzip`,
     * otherwise the plain JSON representation.
     */
    @getMapping('/gzip')
    @parameters({ acceptEncoding: headerValue('accept-encoding') })
    gzip(acceptEncoding?: string) {
        return this.#compressed('gzip', acceptEncoding);
    }

    /**
     * GET /deflate — a deflate-compressed JSON body when the client accepts
     * `deflate`, otherwise the plain JSON representation.
     */
    @getMapping('/deflate')
    @parameters({ acceptEncoding: headerValue('accept-encoding') })
    deflate(acceptEncoding?: string) {
        return this.#compressed('deflate', acceptEncoding);
    }

    /**
     * GET /limit — a `@rateLimit` probe: at most three requests per minute per
     * client address, denied as `429` + `Retry-After`.
     */
    @getMapping('/limit')
    @rateLimit({ limit: 3, windowMs: 60_000 })
    limit() {
        return { limited: true, note: 'at most 3 requests per minute per client' };
    }

    /** `302` with the given `Location`. */
    #redirectTo(location: string) {
        return new ResponseEntity(undefined, ResponseStatuses.FOUND, { [HTTPHeaders.LOCATION.name]: location });
    }

    /** Negotiated `gzip`/`deflate` representation of the sample document. */
    #compressed(encoding: 'gzip' | 'deflate', acceptEncoding: string | undefined) {
        const payload = { encoding, slideshow: { title: 'Sample Slide Show', slug: 'ndigo-httpbin' } };
        if (!(acceptEncoding ?? '').toLowerCase().includes(encoding)) {
            return new ResponseEntity(payload, ResponseStatuses.OK);
        }
        const serialized = Buffer.from(JSON.stringify(payload), 'utf-8');
        const compressed = encoding === 'gzip' ? gzipSync(serialized) : deflateSync(serialized);
        return new ResponseEntity(compressed, ResponseStatuses.OK, {
            [HTTPHeaders.CONTENT_TYPE.name]: 'application/json',
            [HTTPHeaders.CONTENT_ENCODING.name]: encoding,
        });
    }
}
