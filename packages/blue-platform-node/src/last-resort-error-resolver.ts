/**
 * Last-resort error resolver for the Node pipeline: any error that no other
 * `RouteErrorResolver` handled becomes a deterministic 500 JSON response.
 *
 * Without this final link, an unresolved dispatch error falls through the
 * resolver chain to a bare `TypeError('view name is undefined')` in
 * `AbstractDispatcher._processDispatchResult` — surfacing as an empty/500
 * response with no useful contract. This resolver guarantees every error
 * produces a deterministic `500 Internal Server Error` JSON body (internal
 * detail is logged by the adapter, never returned).
 *
 * @module
 * @since 1.0.0
 */

import { AbstractRouteErrorResolver, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ResponseEntity } from './response-entity';

/**
 * A {@link RouteErrorResolver} that always resolves — the final link in the
 * Node error chain. Maps any unhandled error to a 500 JSON response.
 */
export class NodeLastResortErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Maps any error to a 500 JSON response.
     *
     * @param route - The failed route.
     * @param handler - The handler that was executing.
     * @param error - The unhandled error.
     * @returns The 500 response entity.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        // The resolver interface predates the response-entity contract; the
        // runtime value IS a ResponseEntity, which the Node render pipeline
        // honors (isResponseEntity is checked first). Boundary cast.
        const entity: ResponseEntity = ResponseEntity.internalServerError({ error: 'Internal Server Error' });
        return entity as unknown as ModelAndView;
    }
}