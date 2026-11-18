/**
 * Rejects non-2xx responses.
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';

/**
 * Throws a {@link ResponseError} when the response status is outside 200-299.
 */
export class NotOKInterceptor implements ResponseAwareHTTPInterceptor {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NotOKInterceptor".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NotOKInterceptor]"
     */
    get [Symbol.toStringTag](): string {
        return 'NotOKInterceptor';
    }

    /**

     * @param response - The HTTP response
     * @param settings - The HTTP request settings
     * @returns
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        if (!response.ok) {
            throw new ResponseError(response, 'Status Code is not 200-299');
        }
    }
}
