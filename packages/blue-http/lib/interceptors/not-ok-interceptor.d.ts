/**
 * @author Jeff Rose
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
/**
 * @class module:http.NotOKInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export declare class NotOKInterceptor implements ResponseAwareHTTPInterceptor {
    /**
     * @async
     * @function module:http.NotOKInterceptor#postResponse
     * @param {external:Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {external:Promise<external:void>}
     */
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
}
//# sourceMappingURL=not-ok-interceptor.d.ts.map