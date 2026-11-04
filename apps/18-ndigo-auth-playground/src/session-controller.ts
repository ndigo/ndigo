/**
 * Mode 1 — credentials + opaque session cookie, with the flags on display.
 *
 * `POST /auth/login` is JSON-only (`415` otherwise — the login-CSRF defense from
 * guide 11 §5/§6) and rate limited (`@rateLimit`): 5 attempts per minute per
 * client address. Success issues an opaque 32-byte session id from the
 * **durable** store and writes it as an `HttpOnly`, `SameSite=Lax`, `Path=/`
 * cookie — plus `Secure` when `AUTH_COOKIE_SECURE` is on, under the
 * `__Host-ndigo-session` name that mandates it.
 *
 * `POST /auth/elevate` is the session-fixation gate: a privilege change rotates
 * the session id (`SessionStore.rotate`), the new id goes out in a fresh
 * cookie, and the old id is dead immediately — provable one request later
 * against `/auth/me`.
 *
 * The session id is echoed in response bodies on purpose: this app exists to
 * make the credential visible. A real cookie-session app returns the principal
 * only.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    bodyValue,
    cookieValue,
    getMapping,
    headerValue,
    parameters,
    postMapping,
    requestMapping,
    routeValue,
} from '@ndigo/dispatcher';
import { DefaultPrincipal } from '@ndigo/auth-core';
import { MediaTypes } from '@ndigo/core';
import { contentTypeBase, HTTPHeaders } from '@ndigo/http';
import {
    clearSessionCookie,
    rateLimit,
    ResponseEntity,
    setSessionCookie,
    SESSION_COOKIE,
    type SessionCookieOptions,
} from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { LOGIN_RATE_LIMIT, PLAIN_HTTP_SESSION_COOKIE, sessionCookieOptions } from './config';
import type { PlaygroundConfig } from './config';
import { cookieView, MODES, principalView, sessionView } from './api-shape';
import type { AuthStack } from './auth-stack';

/** The role `/auth/elevate` grants — it makes the admin-only route answer 200. */
export const ELEVATED_ROLE = 'admin';

/**
 * Cookie-session mode: login, logout, the protected `/me`, and the
 * fixation-safe privilege-change rotation.
 */
@requestMapping('/auth')
export class SessionController {
    readonly #stack: AuthStack;
    readonly #config: PlaygroundConfig;
    readonly #cookie: SessionCookieOptions;

    /**
     * @param stack - The auth stack (credentials adapter + durable session store).
     * @param config - The resolved configuration (cookie flags).
     */
    constructor(stack: AuthStack, config: PlaygroundConfig) {
        this.#stack = stack;
        this.#config = config;
        this.#cookie = sessionCookieOptions(config);
    }

    /**
     * `POST /auth/login` — JSON credentials in, opaque session out.
     *
     * The response carries the principal, the session id, the cookie attributes
     * that were emitted, and the rate-limit budget this endpoint enforces.
     *
     * @param credentials - The bound JSON body (`{ username, password }`).
     * @param route - The route (the session cookie is written to its response).
     * @param contentType - The request media type (`application/json` only).
     * @returns The session summary, or a `401`/`415` denial.
     */
    @postMapping('/login')
    @rateLimit(LOGIN_RATE_LIMIT)
    @parameters({ credentials: bodyValue(), route: routeValue(), contentType: headerValue('content-type') })
    async login(credentials: unknown, route: Route, contentType: string | undefined) {
        if (contentTypeBase(contentType) !== String(MediaTypes.APPLICATION_JSON)) {
            // A cross-site HTML form can never send `application/json`, so this
            // media-type gate closes the login-CSRF vector (guide 11 §6).
            return ResponseEntity.unsupportedMediaType({ error: 'only_application_json_is_accepted' });
        }
        const submitted = credentials as { username?: unknown; password?: unknown } | null;
        const username = String(submitted?.username ?? '');
        const password = String(submitted?.password ?? '');
        let result;
        try {
            result = await this.#stack.credentials.authenticate({ username, password });
        } catch {
            // One generic denial: wrong password, unknown user and disabled
            // account are indistinguishable (no user enumeration).
            return ResponseEntity.unauthorized({ error: 'invalid_credentials' }, { 'WWW-Authenticate': 'Bearer' });
        }
        if (result.token === null || result.principal === null) {
            return ResponseEntity.unauthorized({ error: 'invalid_credentials' }, { 'WWW-Authenticate': 'Bearer' });
        }
        setSessionCookie(route, result.token, this.#cookie);
        return {
            mode: MODES.cookieSession,
            surface: 'http',
            principal: principalView(result.principal),
            session: sessionView(this.#config, { token: result.token, expiresAt: result.expiresAt ?? undefined }),
            rateLimit: { limit: LOGIN_RATE_LIMIT.limit, windowMs: LOGIN_RATE_LIMIT.windowMs, header: 'Retry-After' },
        };
    }

    /**
     * `POST /auth/logout` — terminates the session and clears the cookie under
     * the same name/`Secure` attributes it was set with.
     *
     * @param secureToken - The credential from the `__Host-` cookie, when presented.
     * @param plainToken - The credential from the plain-HTTP cookie, when presented.
     * @param route - The route (the clear is written to its response).
     * @returns The logout acknowledgement.
     */
    @postMapping('/logout')
    @parameters({
        secureToken: cookieValue(SESSION_COOKIE),
        plainToken: cookieValue(PLAIN_HTTP_SESSION_COOKIE),
        route: routeValue(),
    })
    async logout(secureToken: string | undefined, plainToken: string | undefined, route: Route) {
        const token = secureToken ?? plainToken;
        if (token !== undefined) {
            await this.#stack.credentials.logout(token);
        }
        clearSessionCookie(route, this.#cookie);
        return {
            mode: MODES.cookieSession,
            surface: 'http',
            loggedOut: true,
            clearedCookie: this.#cookie.name,
            cookie: cookieView(this.#config),
        };
    }

    /**
     * `GET /auth/me` — the protected route: resolves the session cookie (or a
     * `Bearer` session id for API clients) and denies `401` without one.
     *
     * @param secureToken - The credential from the `__Host-` cookie, when presented.
     * @param plainToken - The credential from the plain-HTTP cookie, when presented.
     * @param authorization - The raw `Authorization` header, when presented.
     * @returns The principal and its session, or `401`.
     */
    @getMapping('/me')
    @parameters({
        secureToken: cookieValue(SESSION_COOKIE),
        plainToken: cookieValue(PLAIN_HTTP_SESSION_COOKIE),
        authorization: headerValue('authorization'),
    })
    async me(secureToken: string | undefined, plainToken: string | undefined, authorization: string | undefined) {
        const token = secureToken ?? plainToken ?? HTTPHeaders.AUTHORIZATION.bearerToken(authorization) ?? undefined;
        const principal = token === undefined ? null : await this.#stack.credentials.validate(token);
        if (token === undefined || principal === null) {
            return ResponseEntity.unauthorized({ error: 'unauthenticated' }, { 'WWW-Authenticate': 'Bearer' });
        }
        return {
            mode: MODES.cookieSession,
            surface: 'http',
            principal: principalView(principal),
            session: sessionView(this.#config, { token }),
        };
    }

    /**
     * `POST /auth/elevate` — a privilege change on a live session.
     *
     * Implements the fixation rule the hard way round: instead of adopting a new
     * privilege on the *old* session id, the id is rotated (`SessionStore.rotate`,
     * one atomic guarded `UPDATE`) so an attacker who planted a known id before
     * the login/elevation never holds the id that carries the new privilege. The
     * response reports both ids, so the rotation is observable.
     *
     * @param secureToken - The credential from the `__Host-` cookie, when presented.
     * @param plainToken - The credential from the plain-HTTP cookie, when presented.
     * @param route - The route (the rotated cookie is written to its response).
     * @returns The rotation summary, or `401` without a live session.
     */
    @postMapping('/elevate')
    @parameters({
        secureToken: cookieValue(SESSION_COOKIE),
        plainToken: cookieValue(PLAIN_HTTP_SESSION_COOKIE),
        route: routeValue(),
    })
    async elevate(secureToken: string | undefined, plainToken: string | undefined, route: Route) {
        const sessionId = secureToken ?? plainToken;
        const principal = sessionId === undefined ? null : await this.#stack.credentials.validate(sessionId);
        if (sessionId === undefined || principal === null) {
            return ResponseEntity.unauthorized({ error: 'unauthenticated' }, { 'WWW-Authenticate': 'Bearer' });
        }
        const elevated = new DefaultPrincipal(
            principal.id,
            principal.name,
            principal.roles.includes(ELEVATED_ROLE) ? [...principal.roles] : [...principal.roles, ELEVATED_ROLE]
        );
        const rotated = await this.#stack.rotateSession(sessionId, elevated);
        setSessionCookie(route, rotated.token, this.#cookie);
        return {
            mode: MODES.cookieSession,
            surface: 'http',
            privilegeChange: `granted:${ELEVATED_ROLE}`,
            fixation: { previousSessionId: sessionId, sessionId: rotated.token, rotated: rotated.token !== sessionId },
            principal: principalView(elevated),
            session: sessionView(this.#config, rotated),
            cookie: cookieView(this.#config),
        };
    }
}
