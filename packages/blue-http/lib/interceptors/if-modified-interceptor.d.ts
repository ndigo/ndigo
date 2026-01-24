/**
 * @author Jeff Rose
 */
import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
export type IfModifiedInit = HTTPInit & {
    ifModified?: boolean;
};
/**
 * @typedef {module:http.HTTPInit} module:http.IfModifiedInit
 * @property {external:boolean} [ifModified]
 */
/**
 * @class module:http.IfModifiedInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export declare class IfModifiedInterceptor implements InitializationAwareHTTPInterceptor<IfModifiedInit>, ResponseAwareHTTPInterceptor<IfModifiedInit> {
    #private;
    constructor();
    /**
     * @function module:http.IfModifiedInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: IfModifiedInit): boolean;
    /**
     * @async
     * @function module:http.IfModifiedInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.IfModifiedInit} settings
     * @returns {external:Promise<external:void>}
     */
    postResponse({ headers, url }: Response, settings: IfModifiedInit): Promise<void>;
}
//# sourceMappingURL=if-modified-interceptor.d.ts.map