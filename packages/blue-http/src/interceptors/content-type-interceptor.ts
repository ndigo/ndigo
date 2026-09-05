/**
 * @author Jeff Rose
 */

import { MediaType } from '@blue/core';
import { HTTPInit, InitializationAwareHTTPInterceptor } from '../http';
import { CONTENT_TYPE } from '../http-headers';

/**
 * Request settings for {@link ContentTypeInterceptor}.
 */
export type ContentTypeInit = HTTPInit & { contentType?: string | MediaType };

/**
 * Adds a `Content-Type` header when request settings provide one.
 */
export class ContentTypeInterceptor implements InitializationAwareHTTPInterceptor<ContentTypeInit> {
    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @param {URL} url The requested URL.
     * @param {module:http.ContentTypeInit} settings The HTTP request settings, including the `contentType` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: ContentTypeInit): boolean {
        if ('contentType' in settings) {
            const { contentType } = settings,
                headers = new Headers(settings.headers ?? {});
            CONTENT_TYPE.set(headers, typeof contentType === 'string' ? contentType : (contentType?.toString() ?? ''));
            settings.headers = headers;
        }
        return true;
    }
}
