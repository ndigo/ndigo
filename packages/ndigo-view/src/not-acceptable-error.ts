/**
 * Raised when a view name resolves to candidate representations but none
 * satisfies the request's accepted media types (HTTP 406 — the route/handler
 * exists, only the representation is unavailable). Distinct from a missing
 * view, which stays `NoViewFoundError`/404.
 */
import { FrameworkError, MediaType } from '@ndigo/core';

/**
 * NotAcceptableError.
 *
 * @example
 * ```ts
 * const instance = new NotAcceptableError();
 * ```
 */
export class NotAcceptableError extends FrameworkError {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NotAcceptableError".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NotAcceptableError]"
     */
    get [Symbol.toStringTag](): string {
        return 'NotAcceptableError';
    }

    /**
     * The view name whose candidates were unacceptable.
     */
    readonly viewName: string;
    /**
     * The accepted media types considered, in client-priority order.
     */
    readonly acceptedMediaTypes: MediaType[];

    /**
     * Creates a not-acceptable signal for the resolved view name.
     *
     * @param viewName - The view name whose representations were refused.
     * @param acceptedMediaTypes - The request's accepted media types.
     */
    constructor(viewName: string, acceptedMediaTypes: MediaType[]) {
        super(
            `No acceptable representation for view "${viewName}"; accepted: ${
                acceptedMediaTypes.map((mediaType) => String(mediaType)).join(', ') || '(none)'
            }`
        );
        this.viewName = viewName;
        this.acceptedMediaTypes = acceptedMediaTypes;
    }
}
