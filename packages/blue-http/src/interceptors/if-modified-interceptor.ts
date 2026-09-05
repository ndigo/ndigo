/**
 * @author Jeff Rose
 */

import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
import { ETAG, IF_MODIFIED_SINCE, IF_NONE_MATCH, LAST_MODIFIED } from '../http-headers';

/**
 * Request settings for {@link IfModifiedInterceptor}.
 */
export type IfModifiedInit = HTTPInit & { ifModified?: boolean };

/**
 * Adds conditional request headers and caches validators from prior responses.
 */
export class IfModifiedInterceptor
    implements InitializationAwareHTTPInterceptor<IfModifiedInit>, ResponseAwareHTTPInterceptor<IfModifiedInit>
{
    #eTag: Map<string, string>;
    #lastModified: Map<string, string>;

    constructor() {
        this.#eTag = new Map<string, string>();
        this.#lastModified = new Map<string, string>();
    }

    /**
     * @param {URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: IfModifiedInit): boolean {
        if (settings.ifModified) {
            const headers = new Headers(settings.headers ?? {}),
                fullURL = url.toString();
            if (this.#lastModified.has(fullURL)) {
                IF_MODIFIED_SINCE.set(headers, this.#lastModified.get(fullURL));
            }
            if (this.#eTag.has(fullURL)) {
                IF_NONE_MATCH.set(headers, this.#eTag.get(fullURL));
            }
            settings.headers = headers;
        }
        return true;
    }

    /**
     * @async
     * @param {Response} response
     * @param {module:http.IfModifiedInit} settings
     * @returns {Promise<external:void>}
     */
    async postResponse({ headers, url }: Response, settings: IfModifiedInit): Promise<void> {
        if (settings.ifModified) {
            const lastModified = LAST_MODIFIED.get(headers);
            if (lastModified !== null) {
                this.#lastModified.set(url, lastModified);
            }
            const eTag = ETAG.get(headers);
            if (eTag !== null) {
                this.#eTag.set(url, eTag);
            }
        }
    }
}
