/**
 * @author Jeff Rose
 */

import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';

/**
 * Throws a {@link ResponseError} when the response status is outside 200-299.
 *
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class NotOKInterceptor implements ResponseAwareHTTPInterceptor {
    /**
     * @async
     * @param {Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {Promise<external:void>}
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        if (!response.ok) {
            throw new ResponseError(response, 'Status Code is not 200-299');
        }
    }
}
