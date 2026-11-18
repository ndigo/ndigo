/**
 * Applies a content type to request bodies.
 */
import { MediaType } from '@ndigo/core';
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
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ContentTypeInterceptor".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ContentTypeInterceptor]"
     */
    get [Symbol.toStringTag](): string {
        return 'ContentTypeInterceptor';
    }

    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @param url - The requested URL.
     * @param settings - The HTTP request settings, including the `contentType` setting.
     * @returns Whether or not the http request should continue execution.
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
