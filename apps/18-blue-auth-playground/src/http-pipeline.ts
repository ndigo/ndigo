/**
 * The app's HTTP pipeline: the two interceptors this demo adds to the
 * platform's default mapping.
 *
 * `NodeAutoConfiguration.handlerMapping()` owns the mapping — security headers
 * and the (metadata-gated) rate limiter are already on it — so the playground
 * *adds* to that chain instead of replacing it, the same way
 * `09-blue-todobackend` splices in its CORS/JSON gates. Order matters:
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
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HANDLER_MAPPING } from '@blue/dispatcher';
import type { ApplicationContext } from '@blue/context';
import { NodeSessionInterceptor } from '@blue/platform-node';
import { AuthMatrixGuard } from './auth-matrix-guard';
import { AUTH_SCHEME_ORDER, type AuthStack } from './auth-stack';
import type { PlaygroundConfig } from './config';

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
            adapterIds: AUTH_SCHEME_ORDER,
            cookieName: config.cookieName,
        })
    );
}
