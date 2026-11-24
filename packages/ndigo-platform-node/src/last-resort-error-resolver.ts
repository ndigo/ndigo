/**
 * Last-resort error resolver for the Node pipeline: any error that no other.
 */
import { likeClientProblem } from '@ndigo/core';
import { AbstractRouteErrorResolver, ModelAndView } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { ProblemTypes, ResponseStatus, ResponseStatuses } from '@ndigo/http';
import { problemEntity } from './problem-details';

/**
 * A {@link AbstractRouteErrorResolver} that always resolves — the final link in the
 * Node error chain. Renders a client-classified error at its own status;
 * everything else becomes a 500 problem document.
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
     * Renders a client-classified error at its own status, or maps anything
     * else to a 500 problem document.
     *
     * @param route - The failed route (used for `instance`).
     * @param handler - The handler that was executing.
     * @param error - The unhandled error (detail is never returned for 500s).
     * @returns The problem-document response entity.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        if (likeClientProblem(error)) {
            // A client error carries its rendering contract: render its own
            // status instead of collapsing it into the 500 fallback.
            const status =
                ResponseStatus.for(error.problemStatus.code) ??
                new ResponseStatus(error.problemStatus.code, error.problemStatus.text ?? 'Error');
            const entity = problemEntity(status, {
                type: error.problemType,
                ...(error.problemStatus.text === undefined ? {} : { title: error.problemStatus.text }),
                status: error.problemStatus.code,
                detail: error.message,
                instance: route.path,
            });
            // NOTE: bridging to ModelAndView — the source type is wider than this consumer's contract.
            return entity as unknown as ModelAndView;
        }

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
