/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { PathRoute, RouterExecutionChain } from '@blue/router';

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
 * @param route - The candidate route.
 * @param chain - The execution chain resolved for the candidate route.
 * @param commit - Commits the candidate route as the current route.
 * @param restore - Rolls back a rejected or failed route change.
 * @returns `true` when the route was accepted, `false` when rejected or failed.
 * @since 1.0.0
 */
async function commitRoute(
    route: PathRoute,
    chain: RouterExecutionChain,
    commit: () => void,
    restore: () => void
): Promise<boolean> {
    try {
        if ((await chain.applyPreHandle(route)) === false) {
            restore();
            return false;
        }

        commit();

        await chain.applyPostHandle(route);

        return true;
    } catch {
        restore();
        return false;
    } finally {
        await chain.applyAfterCompletion(route);
    }
}

export { commitRoute };
