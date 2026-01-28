/**
 * @author Jeff Rose
 */
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status}
 */
export interface ResponseCodeAwareHTTPInterceptor {
    [statusCode: number]: (response: Response, settings: HTTPInit) => Promise<void>;
}
/**
 */
/**
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseCodeAwareHTTPInterceptor} interceptor
 */
export declare class MappedResponseCodeHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #private;
    /**
     * @readonly
     */
    get interceptor(): ResponseCodeAwareHTTPInterceptor;
    constructor(interceptor: ResponseCodeAwareHTTPInterceptor);
    /**
     * @async
     * @param {Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {Promise<external:void>}
     */
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
}
//# sourceMappingURL=response-code-interceptor.d.ts.map