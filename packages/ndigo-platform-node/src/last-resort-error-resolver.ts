/**
 * Last-resort error resolver for the Node pipeline: any error that no other.
 */
import { AbstractRouteErrorResolver, ModelAndView } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { ResponseStatuses } from '@ndigo/http';
import { problemEntity, ProblemTypes } from './problem-details';

/**
 * A {@link AbstractRouteErrorResolver} that always resolves — the final link in the
 * Node error chain. Maps any unhandled error to a 500 problem document.
 *
 * @example
 * ```ts
 * const instance = new NodeLastResortErrorResolver();
 * ```
 */
export class NodeLastResortErrorResolver extends AbstractRouteErrorResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NodeLastResortErrorResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NodeLastResortErrorResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'NodeLastResortErrorResolver';
    }

    /**
     * Maps any error to a 500 problem document.
     *
     * @param route - The failed route (used for `instance`).
     * @param handler - The handler that was executing.
     * @param error - The unhandled error (detail is never returned).
     * @returns The 500 problem-document response entity.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        const entity = problemEntity(ResponseStatuses.INTERNAL_SERVER_ERROR, {
            type: ProblemTypes.internalError,
            title: 'Internal Server Error',
            status: 500,
            instance: route.path,
        });
        // NOTE: bridging to ModelAndView — the source type is wider than this consumer's contract.
        return entity as unknown as ModelAndView;
    }
}
