/**
 * Node platform default error resolver: request-binding failures → 400.
 *
 * `ParameterBindingError` (and its subclasses — missing required parameters,
 * failed conversions, and Zod validation failures via `ParameterConversionError`)
 * are client errors by definition: the request could not be bound into the
 * handler signature. The generic `MetadataErrorResolver` only resolves
 * user-configured `@errorMapping` handlers, so without this resolver a
 * validation failure falls through to a generic 500/empty response.
 *
 * Node auto-configuration registers this resolver before `MetadataErrorResolver`,
 * so app-level error handlers still win when configured; this is the fallback
 * for the common "request is malformed" case.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractRouteErrorResolver, ParameterBindingError, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ResponseEntity } from './response-entity';

/**
 * A {@link RouteErrorResolver} mapping {@link ParameterBindingError} to a 400
 * `ResponseEntity` carrying the binding failure message.
 *
 * Returns the `ResponseEntity` directly from the resolver chain (not wrapped
 * in a `ModelAndView`): `NodeDispatcher.render` checks `isResponseEntity`
 * before the ModelAndView branch, so the entity's status/headers/body are
 * written verbatim.
 */
export class NodeParameterBindingErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Maps a binding failure to a 400 JSON response.
     *
     * @param route - The failed route.
     * @param handler - The handler that was executing.
     * @param error - The thrown error (a `ParameterBindingError`).
     * @returns The 400 response entity, or `null` for non-binding errors.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        if (!(error instanceof ParameterBindingError)) {
            return null;
        }
        // The resolver interface predates the response-entity contract; the
        // runtime value IS a ResponseEntity, which the Node render pipeline
        // honors (isResponseEntity is checked first). Boundary cast.
        const entity: ResponseEntity = ResponseEntity.badRequest({ error: error.message });
        return entity as unknown as ModelAndView;
    }
}