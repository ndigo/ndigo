/**
 * Last-resort error resolver for the Node pipeline: any error that no other.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractRouteErrorResolver, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ResponseStatuses } from '@blue/http';
import { problemEntity, ProblemTypes } from './problem-details';

/**
 * A {@link AbstractRouteErrorResolver} that always resolves — the final link in the
 * Node error chain. Maps any unhandled error to a 500 problem document.
 */
export class NodeLastResortErrorResolver extends AbstractRouteErrorResolver {
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
        return entity as unknown as ModelAndView;
    }
}
