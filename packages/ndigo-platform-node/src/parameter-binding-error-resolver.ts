/**
 * Node platform default error resolver: request-binding failures → problem.
 */
import { AbstractRouteErrorResolver, ParameterBindingError, ModelAndView, ZodValidationError } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { ResponseStatuses } from '@ndigo/http';
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
