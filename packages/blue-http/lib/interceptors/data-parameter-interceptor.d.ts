/**
 * @author Jeff Rose
 */
import { HTTPInit, InitializationAwareHTTPInterceptor } from '../http';
export type DataInit = BodyInit;
export type DataParameterInit = HTTPInit & {
    data?: DataInit;
};
/**
 * @class module:http.DataParameterInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export declare class DataParameterInterceptor implements InitializationAwareHTTPInterceptor<DataParameterInit> {
    /**
     * module:http.DataParameterInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.DataParameterInit} settings The HTTP request settings, including the `data` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: DataParameterInit): boolean;
}
//# sourceMappingURL=data-parameter-interceptor.d.ts.map