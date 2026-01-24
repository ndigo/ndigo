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
 * @interface module:http.ResponseCodeAwareHTTPInterceptor
 */
/**
 * @class module:http.MappedResponseCodeHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseCodeAwareHTTPInterceptor} interceptor
 */
export declare class MappedResponseCodeHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #private;
    /**
     * @readonly
     * @member {module:http.ResponseCodeAwareHTTPInterceptor} module:http.MappedResponseCodeHTTPInterceptor#interceptor
     */
    get interceptor(): ResponseCodeAwareHTTPInterceptor;
    constructor(interceptor: ResponseCodeAwareHTTPInterceptor);
    /**
     * @async
     * @function module:http.MappedResponseCodeHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
}
//# sourceMappingURL=response-code-interceptor.d.ts.map