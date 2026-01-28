/**
 * @author Jeff Rose
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
/**
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export declare class NotOKInterceptor implements ResponseAwareHTTPInterceptor {
    /**
     * @async
     * @param {Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {Promise<external:void>}
     */
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
}
//# sourceMappingURL=not-ok-interceptor.d.ts.map