/**
 * @author Jeff Rose
 */

import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';

/**
 * @class module:http.NotOKInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class NotOKInterceptor implements ResponseAwareHTTPInterceptor {
    /**
     * @async
     * @function module:http.NotOKInterceptor#postResponse
     * @param {external:Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<void> {
        if (!response.ok) {
            throw new ResponseError(response, 'Status Code is not 200-299');
        }
    }
}
