/**
 * The app's HTTP pipeline: the two interceptors this demo adds to the
 * platform's default mapping.
 *
 * `NodeAutoConfiguration.handlerMapping()` owns the mapping — security headers
 * and the (metadata-gated) rate limiter are already on it — so the playground
 * *adds* to that chain instead of replacing it, the same way
 * `04-ndigo-todo-api` splices in its CORS/JSON gates. Order matters:
 *
 * 1. {@link NodeSessionInterceptor} — resolves the session cookie through the
 *    durable store into the documented `request.session` bag *before* dispatch,
 *    so cookie-authenticated handlers can bind `requestSessionValue('principal')`
 *    without touching the store themselves. Fail-closed: unknown/expired
 *    sessions mean an empty bag, never a fabricated principal, and a duplicated
 *    session cookie is treated as unauthenticated.
 * 2. {@link AuthMatrixGuard} — enforces `@authenticated`/`@authorized` over
 *    either scheme (cookie session id or Bearer access token) and, on success,
 *    (re)writes the principal into the same bag, so both schemes reach handlers
 *    through one seam.
 *
 * Both run after the platform's rate limiter, which is deliberate: an
 * over-budget request is cheap to reject and never reaches credential
 * verification.
 *
 * Called after the context has refreshed — by the bootstrap and by the test
 * harness, so tests dispatch through exactly the production chain.
 */
import { HANDLER_MAPPING } from '@ndigo/dispatcher';
import type { ApplicationContext } from '@ndigo/context';
import { HTTPHeaders } from '@ndigo/http';
import { getNodeRequest, hasDuplicateCookie, NodeSessionInterceptor } from '@ndigo/platform-node';
import { AuthMatrixGuard } from '@ndigo/auth-server';
import { AUTH_SCHEME_ORDER, type AuthStack } from './auth-stack';
import type { PlaygroundConfig } from './config';

/** Session-bag key holding the authenticated principal (matches NodeSessionInterceptor). */
export const REQUEST_PRINCIPAL_KEY = 'principal';

/** Session-bag key holding the credential the principal was resolved from. */
export const REQUEST_TOKEN_KEY = 'token';

/**
 * Installs the session restoration and the dual-scheme authorization guard on
 * the platform's handler mapping.
 *
 * @param context - The refreshed application context.
 * @param stack - The auth stack (session store + adapter resolution).
 * @param config - The resolved configuration (session cookie name).
 */
export function applyAuthPipeline(context: ApplicationContext, stack: AuthStack, config: PlaygroundConfig): void {
    const mapping = context.getValue(HANDLER_MAPPING);
    mapping.interceptors.push(
        new NodeSessionInterceptor(stack.sessions, config.cookieName),
        new AuthMatrixGuard(stack.server, {
            // Cookie session id first (AUTH_SCHEME_ORDER[0]), Bearer access token
            // second — extraction priority follows AUTH_SCHEME_ORDER, and the guard
            // validates the winning credential against both ids via validateAny.
            schemes: [
                {
                    adapterId: AUTH_SCHEME_ORDER[0],
                    extract: (route) => {
                        const request = getNodeRequest(route);
                        if (!request) {
                            return null;
                        }
                        if (hasDuplicateCookie(request.headers?.['cookie'], config.cookieName)) {
                            return null;
                        }
                        const cookie = request.cookies?.[config.cookieName];
                        return typeof cookie === 'string' && cookie !== '' ? cookie : null;
                    },
                },
                {
                    adapterId: AUTH_SCHEME_ORDER[1],
                    extract: (route) => {
                        const request = getNodeRequest(route);
                        if (!request) {
                            return null;
                        }
                        const authorization = request.headers?.['authorization'];
                        return (
                            HTTPHeaders.AUTHORIZATION.bearerToken(
                                Array.isArray(authorization) ? authorization[0] : authorization
                            ) ?? null
                        );
                    },
                },
            ],
            // Stash the resolved principal + token in the same bag NodeSessionInterceptor
            // fills for cookies, so both schemes reach handlers through one seam.
            onAuthenticated: (route, principal, token) => {
                const request = getNodeRequest(route);
                if (!request) {
                    return;
                }
                request.session[REQUEST_PRINCIPAL_KEY] = principal;
                request.session[REQUEST_TOKEN_KEY] = token;
            },
        })
    );
}
