/**
 * View targeter that writes each render pass to the HTTP response.
 */
import type { ViewTargeter, ViewTargetingContext } from '@ndigo/view';
import { HTTPResponseViewTarget } from './node-view-target';
import { getNodeResponse } from './node-request';

/**
 * Resolves the per-request HTTP response target.
 *
 * Node has one destination per request, so this targeter is the platform's
 * built-in chain entry: it always returns a fresh `HTTPResponseViewTarget`
 * over the response the HTTP adapter stored on the route. A result that
 * supplies its own target (`ModelAndView.viewTarget`) still wins, which is how
 * Node tests observe rendering and how streaming transports can redirect
 * output.
 */
export class ResponseViewTargeter implements ViewTargeter {
    /**
     * Resolves the HTTP response target for the current route.
     *
     * The target is created even when the route carries no response: its
     * `commit()` is a no-op in that case, which preserves the pre-targeter
     * behavior for dispatches that are not HTTP-backed (tests, tooling).
     *
     * @param context - The render pass being targeted.
     * @returns A fresh response target.
     */
    resolveViewTarget(context: ViewTargetingContext): HTTPResponseViewTarget {
        return new HTTPResponseViewTarget(getNodeResponse(context.route));
    }
}
