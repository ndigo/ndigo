/**
 * Node platform default error resolver: request-binding failures → problem.
 */
import { AbstractRouteErrorResolver, ParameterBindingError, ModelAndView, ZodValidationError } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { ResponseStatuses } from '@ndigo/http';
import { ProblemTypes } from '@ndigo/http';
import { problemEntity } from './problem-details';

/**
 * A {@link AbstractRouteErrorResolver} mapping {@link ParameterBindingError} to
 * 400/422 problem documents.
 *
 * @example
 * ```ts
 * const instance = new NodeParameterBindingErrorResolver();
 * ```
 */
export class NodeParameterBindingErrorResolver extends AbstractRouteErrorResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NodeParameterBindingErrorResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NodeParameterBindingErrorResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'NodeParameterBindingErrorResolver';
    }

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
            // The source type is wider than this consumer's contract; the assertion is confined to this boundary.
            return entity as unknown as ModelAndView;
        }
        const badRequest = problemEntity(ResponseStatuses.BAD_REQUEST, {
            type: ProblemTypes.bindingFailed,
            title: 'Bad Request',
            status: 400,
            detail: error.message,
            instance,
        });
        // The source type is wider than this consumer's contract; the assertion is confined to this boundary.
        return badRequest as unknown as ModelAndView;
    }
}
