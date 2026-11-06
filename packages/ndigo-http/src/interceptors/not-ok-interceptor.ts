/**
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';

/**
 * Throws a {@link ResponseError} when the response status is outside 200-299.
 */
export class NotOKInterceptor implements ResponseAwareHTTPInterceptor {
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
