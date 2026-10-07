/**
 * Mode 2 — JWT: a 60-second access token plus a rotating refresh token.
 *
 * Access tokens are signed HS256 by the framework's `JWTAdapter`
 * (`@blue/auth-server`) against the shared demo secret, carry the `ver` claim
 * that makes revocation a single counter bump, and are **not** accepted from a
 * cookie: a JWT is presented as `Authorization: Bearer …`.
 *
 * Failures are distinguishable on purpose — the whole point of the mode:
 * `token_missing`, `token_expired`, `token_invalid` and `refresh_rejected` are
 * separate problems (`urn:blue-auth-playground:…` + a `code` extension member),
 * so a client can tell "get a new token" from "your token is not ours". The
 * expiry label comes from an unverified claim read (`jose.decodeJwt`); the
 * authority is always `JWTAdapter.validate`, which verifies the signature,
 * issuer, audience, `exp` and the `ver` counter.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { decodeJwt, errors, jwtVerify } from 'jose';
import { bodyValue, getMapping, headerValue, parameters, postMapping, requestMapping } from '@blue/dispatcher';
import { MediaTypes } from '@blue/core';
import { contentTypeBase, HTTPHeaders } from '@blue/http';
import { rateLimit, ResponseEntity, type ProblemDetails } from '@blue/platform-node';
import { JWTTokenError } from '@blue/auth-server';
import { LOGIN_RATE_LIMIT } from './config';
import type { PlaygroundConfig } from './config';
import { MODES, principalView, type PrincipalView } from './api-shape';
import type { AuthStack } from './auth-stack';

/** The `type` of every JWT problem document from this app. */
const JWT_PROBLEM_TYPE = 'urn:blue-auth-playground:jwt';

/** Distinguishable JWT failure codes. */
export type JwtFailureCode =
    | 'invalid_credentials'
    | 'token_missing'
    | 'token_expired'
    | 'token_invalid'
    | 'refresh_rejected';

/** A JWT problem document, carrying its machine-readable `code`. */
export interface JwtProblem extends ProblemDetails {
    readonly code: JwtFailureCode;
}

/**
 * The mode's whole failure vocabulary, in one static table: same `type`, a
 * distinct `code` and a `detail` that says what to do next.
 */
export const JWT_FAILURES: Record<JwtFailureCode, JwtProblem> = {
    invalid_credentials: {
        type: JWT_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'invalid_credentials',
        detail: 'Username/password did not verify — no token pair was issued',
    },
    token_missing: {
        type: JWT_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'token_missing',
        detail: 'No Authorization: Bearer header — POST /jwt/login for an access token',
    },
    token_expired: {
        type: JWT_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'token_expired',
        detail: 'The access token is past its exp — POST /jwt/refresh with the refresh token',
    },
    token_invalid: {
        type: JWT_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'token_invalid',
        detail: 'The access token did not verify (signature, issuer, audience, revocation, or it is a refresh token)',
    },
    refresh_rejected: {
        type: JWT_PROBLEM_TYPE,
        title: 'Unauthorized',
        status: 401,
        code: 'refresh_rejected',
        detail: 'The refresh token was refused (unknown, superseded by a newer rotation, or its account is disabled)',
    },
};

/**
 * Unverified claim read — used only to report `exp` on a token the adapter has
 * already accepted (see {@link JWTAdapter.validate}).
 *
 * @param token - The presented token.
 * @returns The `exp` claim in seconds, or `null` when the token is not decodable.
 */
function readExpirySeconds(token: string): number | null {
    try {
        const claims = decodeJwt(token);
        return typeof claims.exp === 'number' ? claims.exp : null;
    } catch {
        return null;
    }
}

/**
 * Decides whether a rejected presentation is an **expired** token of ours or
 * simply not ours.
 *
 * `JWTAdapter.validate` answers `null` for every failure, so the failure name
 * has to come from somewhere. Rather than trust an unverified `exp` claim (a
 * forged token could then masquerade as "just expired"), the signature, issuer
 * and audience are re-checked here against the same secret and claims the
 * adapter uses; only a token that genuinely verifies as ours — and is then
 * rejected for `exp` alone — is labelled expired. Everything else (bad
 * signature, foreign issuer/audience, malformed, or a revoked `ver`) is
 * invalid.
 *
 * This is a *label*, not an authorization decision: the request is already
 * denied, and `validate` remains the only thing that can accept a token.
 *
 * @param token - The rejected token.
 * @param config - The resolved configuration (secret, issuer, audience).
 * @returns `true` only for a signature-valid, issuer/audience-correct, expired token.
 */
async function expiredAccessToken(token: string, config: PlaygroundConfig): Promise<boolean> {
    try {
        await jwtVerify(token, new TextEncoder().encode(config.jwt.secret), {
            issuer: config.jwt.issuer,
            audience: config.jwt.audience,
            algorithms: ['HS256'],
        });
        // Verified: the adapter rejected it for another reason (revocation).
        return false;
    } catch (error) {
        // `jose` distinguishes the expiry failure from every other claim/signature failure.
        return error instanceof errors.JWTExpired;
    }
}

/**
 * JWT mode: issue a token pair, read it back, rotate it.
 */
@requestMapping('/jwt')
export class JwtController {
    readonly #stack: AuthStack;
    readonly #config: PlaygroundConfig;

    /**
     * @param stack - The auth stack (JWT adapter + user store).
     * @param config - The resolved configuration (token lifetimes).
     */
    constructor(stack: AuthStack, config: PlaygroundConfig) {
        this.#stack = stack;
        this.#config = config;
    }

    /**
     * `POST /jwt/login` — credentials in, token pair out.
     *
     * @param credentials - The bound JSON body (`{ username, password }`).
     * @param contentType - The request media type (`application/json` only).
     * @returns The token pair plus the refresh recipe, or `401`/`415`.
     */
    @postMapping('/login')
    @rateLimit(LOGIN_RATE_LIMIT)
    @parameters({ credentials: bodyValue(), contentType: headerValue('content-type') })
    async login(credentials: unknown, contentType: string | undefined) {
        if (contentTypeBase(contentType) !== String(MediaTypes.APPLICATION_JSON)) {
            return ResponseEntity.unsupportedMediaType({ error: 'only_application_json_is_accepted' });
        }
        const submitted = credentials as { username?: unknown; password?: unknown } | null;
        const account = await this.#stack.verifyPassword(
            String(submitted?.username ?? ''),
            String(submitted?.password ?? '')
        );
        if (account === null) {
            return ResponseEntity.unauthorized(JWT_FAILURES.invalid_credentials, { 'WWW-Authenticate': 'Bearer' });
        }
        // `issueTokens` snapshots the account's live `tokenVersion` into the
        // `ver` claim — the hook every later revocation rides on.
        const issued = await this.#stack.jwt.issueTokens({ id: account.id });
        const principal: PrincipalView = {
            id: account.id,
            name: account.username,
            roles: [...(account.roles ?? [])],
        };
        return {
            mode: MODES.jwt,
            surface: 'http',
            tokenType: 'Bearer',
            accessToken: issued.accessToken,
            refreshToken: issued.refreshToken,
            principal,
            expiresAt: issued.expiresAt,
            expiresInMs: this.#config.jwt.accessTtlMs,
            refreshEndpoint: 'POST /jwt/refresh',
            rateLimit: { limit: LOGIN_RATE_LIMIT.limit, windowMs: LOGIN_RATE_LIMIT.windowMs, header: 'Retry-After' },
        };
    }

    /**
     * `GET /jwt/me` — validates the presented access token.
     *
     * @param authorization - The raw `Authorization` header, when presented.
     * @returns The principal and the token's expiry, or a distinguishable `401`.
     */
    @getMapping('/me')
    @parameters({ authorization: headerValue('authorization') })
    async me(authorization: string | undefined) {
        const token = HTTPHeaders.AUTHORIZATION.bearerToken(authorization);
        if (token === undefined) {
            return ResponseEntity.unauthorized(JWT_FAILURES.token_missing, { 'WWW-Authenticate': 'Bearer' });
        }
        const principal = await this.#stack.jwt.validate(token);
        if (principal === null) {
            const expired = await expiredAccessToken(token, this.#config);
            return ResponseEntity.unauthorized(expired ? JWT_FAILURES.token_expired : JWT_FAILURES.token_invalid, {
                'WWW-Authenticate': 'Bearer',
            });
        }
        const expSeconds = readExpirySeconds(token);
        return {
            mode: MODES.jwt,
            surface: 'http',
            principal: principalView(principal),
            accessTokenExpiresAt: expSeconds === null ? null : expSeconds * 1000,
            refreshEndpoint: 'POST /jwt/refresh',
        };
    }

    /**
     * `POST /jwt/refresh` — rotates the refresh token and issues a new pair.
     *
     * Rotation advances the account's `tokenVersion` (AD-33 D-7), so the
     * presented refresh token — and every access token already minted for that
     * account — is dead the moment this succeeds: a replayed refresh token is
     * rejected by construction, not by a ledger.
     *
     * @param payload - The bound JSON body (`{ refreshToken }`), when sent.
     * @param authorization - The raw `Authorization` header, as the alternative channel.
     * @returns The new token pair, or `401 refresh_rejected`.
     */
    @postMapping('/refresh')
    @parameters({ payload: bodyValue(), authorization: headerValue('authorization') })
    async refresh(payload: unknown, authorization: string | undefined) {
        const body = payload as { refreshToken?: unknown } | null;
        const fromBody = typeof body?.refreshToken === 'string' && body.refreshToken !== '' ? body.refreshToken : null;
        const presented = fromBody ?? HTTPHeaders.AUTHORIZATION.bearerToken(authorization) ?? null;
        if (presented === null) {
            return ResponseEntity.unauthorized(JWT_FAILURES.refresh_rejected, { 'WWW-Authenticate': 'Bearer' });
        }
        try {
            const rotated = await this.#stack.jwt.refresh(presented);
            return {
                mode: MODES.jwt,
                surface: 'http',
                rotated: true,
                tokenType: 'Bearer',
                accessToken: rotated.token,
                refreshToken: rotated.refreshToken,
                principal: rotated.principal === null ? null : principalView(rotated.principal),
                expiresAt: rotated.expiresAt,
                expiresInMs: this.#config.jwt.accessTtlMs,
            };
        } catch (error) {
            // The adapter's own taxonomy (invalid / not a refresh token /
            // superseded by a concurrent rotation / account disabled) is the
            // `detail`; the wire code stays one value so a client learns nothing
            // it did not already hold.
            const detail = error instanceof JWTTokenError ? error.message : JWT_FAILURES.refresh_rejected.detail;
            return ResponseEntity.unauthorized(
                { ...JWT_FAILURES.refresh_rejected, detail },
                { 'WWW-Authenticate': 'Bearer' }
            );
        }
    }
}
