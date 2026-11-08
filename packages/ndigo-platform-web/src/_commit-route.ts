/**
 * Route-commit pipeline shared by the web router adapters.
 */
import { PathRoute, RouterExecutionChain } from '@ndigo/router';
import type { RouterErrorHandler } from '@ndigo/router';

/**
 * Runs the full router interceptor pipeline for a candidate route:
 * `preHandle` in registration order (short-circuiting on rejection), then
 * `postHandle` and `afterCompletion` in reverse registration order.
 *
 * The candidate route is committed only once `preHandle` accepts it, so a
 * rejection or a `postHandle` failure leaves the caller's current route
 * untouched; `restore` runs in both cases so routers can roll back state that
 * was optimistically synchronized (e.g. the URL hash). `afterCompletion`
 * always runs — also for rejected and failed route changes.
 *
 * Failures are surfaced through the optional `onError` hook and turned into a
 * `false` result: a throwing `postHandle` or `afterCompletion` must not escape
 * the boolean contract or become an unhandled rejection (PWB-REV-015).
 *
 * @param route - The candidate route.
 * @param chain - The execution chain resolved for the candidate route.
 * @param commit - Commits the candidate route as the current route.
 * @param restore - Rolls back a rejected or failed route change.
 * @param onError - Surfaces a pipeline failure (defaults to silent when omitted).
 * @returns `true` when the route was accepted, `false` when rejected or failed.
 */
async function commitRoute(
    route: PathRoute,
    chain: RouterExecutionChain,
    commit: () => void,
    restore: () => void,
    onError?: RouterErrorHandler
): Promise<boolean> {
    try {
        if ((await chain.applyPreHandle(route)) === false) {
            restore();
            return false;
        }

        commit();

        await chain.applyPostHandle(route);

        return true;
    } catch (error) {
        onError?.(error, route);
        restore();
        return false;
    } finally {
        try {
            await chain.applyAfterCompletion(route);
        } catch (error) {
            onError?.(error, route);
        }
    }
}

export { commitRoute };
