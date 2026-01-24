/**
 * @author Jeff Rose
 */
import { CompletionAwareHTTPInterceptor, ErrorAwareHTTPInterceptor, HTTPInit, InitializationAwareHTTPInterceptor } from '../http';
export type TimeoutInit = HTTPInit & {
    timeout?: number;
};
/**
 * @class module:http.TimeoutInterceptor
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export declare class TimeoutInterceptor implements InitializationAwareHTTPInterceptor<TimeoutInit>, ErrorAwareHTTPInterceptor, CompletionAwareHTTPInterceptor {
    #private;
    readonly timeout: number;
    constructor(timeout: number);
    /**
     * @function module:http.TimeoutInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: TimeoutInit): boolean;
    /**
     * @async
     * @function module:http.TimeoutInterceptor#postError
     * @param {external:Error} error The error that was thrown
     * @param {external:Request} request The HTTP request
     * @returns {exteral:Promise<external:Response | external:undefined>}
     */
    postError(error: Error, request: Request): Promise<Response | undefined>;
    /**
     * @function module:http.TimeoutInterceptor#postComplete
     * @param {external:Request} request The HTTP request
     * @param {external:Response} response The HTTP response
     */
    postComplete(request: Request, response: Response): void;
    private _clearTimeout;
}
//# sourceMappingURL=timeout-interceptor.d.ts.map