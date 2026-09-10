/**
 * Node platform default error resolver: request-binding failures → problem
 * documents (AD-10, RFC 9457).
 *
 * `ParameterBindingError` (and its subclasses — missing required parameters,
 * failed conversions, and Zod validation failures via `ParameterConversionError`)
 * are client errors by definition: the request could not be bound into the
 * handler signature. The generic `MetadataErrorResolver` only resolves
 * user-configured `@errorMapping` handlers, so without this resolver a
 * validation failure falls through to a generic 500/empty response.
 *
 * Resolutions (per the AD-10 status table):
 * - `ZodValidationError` cause (from `validatedBy`): `422 Unprocessable
 *   Entity`, `urn:blue:validation-failed`, with the structured issues in the
 *   `errors` extension member.
 * - Any other binding failure: `400 Bad Request`, `urn:blue:binding-failed`.
 *
 * Node auto-configuration registers this resolver before `MetadataErrorResolver`,
 * so app-level error handlers still win when configured.
 *
 * @module
 * @since 1.0.0
 */

import { AbstractRouteErrorResolver, ParameterBindingError, ModelAndView, ZodValidationError } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ResponseStatuses } from '@blue/http';
import { problemEntity, ProblemTypes } from './problem-details';

/**
 * A {@link AbstractRouteErrorResolver} mapping {@link ParameterBindingError} to
 * 400/422 problem documents.
 */
export class NodeParameterBindingErrorResolver extends AbstractRouteErrorResolver {
    /**
     * Maps a binding failure to a 400/422 problem document.
     *
     * @param route - The failed route (used for `instance`).
     * @param handler - The handler that was executing.
     * @param error - The thrown error (a `ParameterBindingError`).
     * @returns The problem-document response entity, or `null` for non-binding errors.
     */
    protected _resolveError(route: Route, handler: object | null, error: Error): ModelAndView | null {
        if (!(error instanceof ParameterBindingError)) {
            return null;
        }
        const instance = route.path;
        const cause = error.cause;
        if (cause instanceof ZodValidationError) {
            // Phase 4A structured issues ride along in the extension member.
            const entity = problemEntity(ResponseStatuses.UNPROCESSABLE_ENTITY, {
                type: ProblemTypes.validationFailed,
                title: 'Validation Failed',
                status: 422,
                detail: error.message,
                instance,
                errors: cause.issues,
            });
            return entity as unknown as ModelAndView;
        }
        const badRequest = problemEntity(ResponseStatuses.BAD_REQUEST, {
            type: ProblemTypes.bindingFailed,
            title: 'Bad Request',
            status: 400,
            detail: error.message,
            instance,
        });
        return badRequest as unknown as ModelAndView;
    }
}
