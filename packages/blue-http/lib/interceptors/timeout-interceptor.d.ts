/**
 * @author Jeff Rose
 */
import { CompletionAwareHTTPInterceptor, ErrorAwareHTTPInterceptor, HTTPInit, InitializationAwareHTTPInterceptor } from '../http';
export type TimeoutInit = HTTPInit & {
    timeout?: number;
};
/**
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export declare class TimeoutInterceptor implements InitializationAwareHTTPInterceptor<TimeoutInit>, ErrorAwareHTTPInterceptor, CompletionAwareHTTPInterceptor {
    #private;
    readonly timeout: number;
    constructor(timeout: number);
    /**
     * @param {URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: TimeoutInit): boolean;
    /**
     * @async
     * @param {Error} error The error that was thrown
     * @param {Request} request The HTTP request
     * @returns {exteral:Promise<external:Response | external:undefined>}
     */
    postError(error: Error, request: Request): Promise<Response | undefined>;
    /**
     * @param {Request} request The HTTP request
     * @param {Response} response The HTTP response
     */
    postComplete(request: Request, response: Response): void;
    private _clearTimeout;
}
//# sourceMappingURL=timeout-interceptor.d.ts.map