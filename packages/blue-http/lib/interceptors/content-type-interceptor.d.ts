/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';
import { HTTPInit, InitializationAwareHTTPInterceptor } from '../http';
export type ContentTypeInit = HTTPInit & {
    contentType?: string | MediaType;
};
/**
 * @typedef {module:http.HTTPInit} module:http.ContentTypeInit
 * @property {external:string | module:core.MediaType} [contentType] The `Content-Type` to append to request headers
 */
/**
 * @class module:http.ContentTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export declare class ContentTypeInterceptor implements InitializationAwareHTTPInterceptor<ContentTypeInit> {
    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @function module:http.ContentTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ContentTypeInit} settings The HTTP request settings, including the `contentType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: ContentTypeInit): boolean;
}
//# sourceMappingURL=content-type-interceptor.d.ts.map