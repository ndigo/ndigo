/**
 * @author Jeff Rose
 */

import { MediaType } from '@blue/core';
import { HTTPInit, InitializationAwareHTTPInterceptor } from '../http';
import { CONTENT_TYPE } from '../http-headers';

export type ContentTypeInit = HTTPInit & { contentType?: string | MediaType };

/**
 * @typedef {module:http.HTTPInit} module:http.ContentTypeInit
 * @property {external:string | module:core.MediaType} [contentType] The `Content-Type` to append to request headers
 */

/**
 * @class module:http.ContentTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class ContentTypeInterceptor implements InitializationAwareHTTPInterceptor<ContentTypeInit> {
    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @function module:http.ContentTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ContentTypeInit} settings The HTTP request settings, including the `contentType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit( url: URL, settings: ContentTypeInit ): boolean {
        if( 'contentType' in settings ){
            const
                { contentType } = settings,
                headers = new Headers( settings.headers ?? {} );
            CONTENT_TYPE.set( headers, typeof contentType === 'string' ? contentType : contentType.toString() );
            settings.headers = headers;
        }
        return true;
    }
}
