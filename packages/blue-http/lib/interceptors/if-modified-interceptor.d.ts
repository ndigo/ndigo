/**
 * @author Jeff Rose
 */
import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
export type IfModifiedInit = HTTPInit & {
    ifModified?: boolean;
};
/**
 * @typedef {module:http.HTTPInit} module:http.IfModifiedInit
 * @property {boolean} [ifModified]
 */
/**
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export declare class IfModifiedInterceptor implements InitializationAwareHTTPInterceptor<IfModifiedInit>, ResponseAwareHTTPInterceptor<IfModifiedInit> {
    #private;
    constructor();
    /**
     * @param {URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: IfModifiedInit): boolean;
    /**
     * @async
     * @param {Response} response
     * @param {module:http.IfModifiedInit} settings
     * @returns {Promise<external:void>}
     */
    postResponse({ headers, url }: Response, settings: IfModifiedInit): Promise<void>;
}
//# sourceMappingURL=if-modified-interceptor.d.ts.map