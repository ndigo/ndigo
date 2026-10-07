/**
 * The wire shapes the playground reports about auth state.
 *
 * Every mode answers the same three nested views — principal, session and
 * cookie — so the browser client, the README transcripts and the tests all read
 * one vocabulary instead of each mode inventing its own. Nothing here
 * authenticates anything; it only *describes* the outcome (the ids are shown on
 * purpose: the playground exists to make session identifiers visible).
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SESSION_COOKIE } from '@blue/platform-node';
import type { Principal } from '@blue/auth-core';
import { PLAIN_HTTP_SESSION_COOKIE, type PlaygroundConfig } from './config';

/** Mode identifiers, as they appear in every response body. */
export const MODES = {
    /** Opaque server session delivered as an HttpOnly cookie (mode 1). */
    cookieSession: 'cookie-session',
    /** Short-lived JWT access token + rotating refresh token (mode 2). */
    jwt: 'jwt',
    /** Role/permission enforcement on HTTP and socket surfaces (mode 3). */
    roles: 'roles',
    /** OIDC authorization-code + PKCE against the embedded issuer (mode 6). */
    oidc: 'oidc',
} as const;

/** A mode identifier. */
export type Mode = (typeof MODES)[keyof typeof MODES];

/** The principal, flattened for JSON. */
export interface PrincipalView {
    readonly id: string;
    readonly name: string;
    readonly roles: readonly string[];
}

/**
 * Flattens a {@link Principal} for a response body.
 *
 * @param principal - The authenticated principal.
 * @returns The JSON view.
 */
export function principalView(principal: Principal): PrincipalView {
    return { id: principal.id, name: principal.name, roles: [...principal.roles] };
}

/** The session cookie's attributes, as actually emitted. */
export interface CookieView {
    readonly name: string;
    readonly httpOnly: boolean;
    readonly sameSite: string;
    readonly path: string;
    readonly secure: boolean;
}

/**
 * Describes the session cookie this process emits: `HttpOnly`, `SameSite=Lax`
 * and `Path=/` are fixed by the framework's `buildSessionCookie`; `Secure` —
 * and therefore the `__Host-` cookie name, which mandates it — is the
 * configurable flag this playground exists to demonstrate.
 *
 * @param config - The resolved configuration.
 * @returns The cookie attributes.
 */
export function cookieView(config: PlaygroundConfig): CookieView {
    return {
        name: config.cookieName,
        httpOnly: true,
        sameSite: 'Lax',
        path: '/',
        secure: config.cookieSecure,
    };
}

/** An issued opaque session as reported on the wire. */
export interface SessionView {
    /** The opaque session id — the credential a client would hold. */
    readonly id: string;
    /** Absolute expiry (epoch ms), when the issuing call knows it. */
    readonly expiresAt?: number;
    /** The cookie the same value was written to. */
    readonly cookie: CookieView;
}

/**
 * Builds the {@link SessionView} for a created, rotated or presented session.
 *
 * @param config - The resolved configuration.
 * @param session - The store's token, plus its effective expiry when known.
 * @returns The JSON view.
 */
export function sessionView(config: PlaygroundConfig, session: { token: string; expiresAt?: number }): SessionView {
    return { id: session.token, expiresAt: session.expiresAt, cookie: cookieView(config) };
}

/**
 * The cookie names a playground process can ever emit — one per `Secure` mode.
 * Handlers bind exactly these two and take whichever the request presented,
 * because `@parameters` metadata is evaluated at class-definition time and
 * cannot read the configuration.
 */
export const PRESENTABLE_COOKIE_NAMES = [SESSION_COOKIE, PLAIN_HTTP_SESSION_COOKIE] as const;
