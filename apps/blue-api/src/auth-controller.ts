/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import {
    getMapping,
    postMapping,
    requestMapping,
    parameters,
    bodyValue,
    routeValue,
    cookieValue,
} from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { ResponseEntity, SESSION_COOKIE, setSessionCookie, clearSessionCookie, rateLimit } from '@blue/platform-node';
import { authenticate, lookupPrincipal, invalidateToken } from './auth-store';

@requestMapping('/auth')
export class AuthController {
    /**
     * POST /auth/login — authenticates credentials through the
     * 'credentials' adapter (scrypt verify + opaque session, AD-33) and
     * returns the token in the body (API-client flows) while also issuing
     * it as an HttpOnly session cookie (server-rendered flows).
     * Returns 401 with an error body on bad credentials.
     *
     * Rate-limited (SEC-6 Wave 3): 5 attempts per minute per client
     * address — credential endpoints are the brute-force surface.
     */
    @postMapping('/login')
    @rateLimit({ limit: 5, windowMs: 60_000 })
    @parameters({ credentials: bodyValue(), route: routeValue() })
    async login(credentials: unknown, route: Route) {
        const value = credentials as { username?: unknown; password?: unknown } | null;
        const token = await authenticate(String(value?.username ?? ''), String(value?.password ?? ''));

        if (!token) {
            return ResponseEntity.unauthorized({ error: 'Invalid credentials' }, { 'WWW-Authenticate': 'Bearer' });
        }

        // HttpOnly session cookie for cookie-based flows. `Secure` is
        // disabled for the localhost demo; the framework default is
        // Secure-on (see buildSessionCookie).
        setSessionCookie(route, token, { secure: false });
        const principal = await lookupPrincipal(token);
        return { token, name: principal?.name, roles: principal?.roles ?? [] };
    }

    /**
     * POST /auth/logout — terminates the session and clears the cookie.
     */
    @postMapping('/logout')
    @parameters({ token: cookieValue(SESSION_COOKIE), route: routeValue() })
    async logout(token: string | undefined, route: Route) {
        if (token) {
            await invalidateToken(token);
        }
        clearSessionCookie(route);
        return { ok: true };
    }

    /**
     * GET /auth/me — the demo's protected route: resolves the session
     * cookie through the adapter and denies (401) without a valid session.
     *
     * The demo enforces in-handler through the AuthServer-backed lookup;
     * the declarative `@authenticated` + `AuthRouteGuard` mapping wiring is
     * exercised in the blue-auth-server spec suite (the demo's handler
     * mapping is owned by the platform auto-config — one owner per
     * `handlerMappings` collection, see the auth completion plan Wave 2
     * as-built notes).
     */
    @getMapping('/me')
    @parameters({ token: cookieValue(SESSION_COOKIE) })
    async me(token: string | undefined) {
        const principal = token ? await lookupPrincipal(token) : null;
        if (!principal) {
            return ResponseEntity.unauthorized({ error: 'Unauthorized' });
        }
        return { name: principal.name, roles: principal.roles };
    }
}
