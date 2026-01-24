/**
 * @author Jeff Rose
 */

import { HTTPInit, InitializationAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
import { ETAG, IF_MODIFIED_SINCE, IF_NONE_MATCH, LAST_MODIFIED } from '../http-headers';

export type IfModifiedInit = HTTPInit & { ifModified?: boolean };

/**
 * @typedef {module:http.HTTPInit} module:http.IfModifiedInit
 * @property {external:boolean} [ifModified]
 */

/**
 * @class module:http.IfModifiedInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class IfModifiedInterceptor implements InitializationAwareHTTPInterceptor<IfModifiedInit>, ResponseAwareHTTPInterceptor<IfModifiedInit> {
    #eTag: Map<string, string>;
    #lastModified: Map<string, string>;

    constructor(){
        this.#eTag = new Map<string, string>();
        this.#lastModified = new Map<string, string>();
    }

    /**
     * @function module:http.IfModifiedInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit( url: URL, settings: IfModifiedInit ): boolean {
        if( settings.ifModified ){
            const
                headers = new Headers( settings.headers ?? {} ),
                fullURL = url.toString();
            this.#lastModified.has( fullURL ) && IF_MODIFIED_SINCE.set( headers, this.#lastModified.get( fullURL ) );
            this.#eTag.has( fullURL ) && IF_NONE_MATCH.set( headers, this.#eTag.get( fullURL ) );
            settings.headers = headers;
        }
        return true;
    }

    /**
     * @async
     * @function module:http.IfModifiedInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.IfModifiedInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse( { headers, url }: Response, settings: IfModifiedInit ): Promise<void> {
        if( settings.ifModified ){
            LAST_MODIFIED.has( headers ) && this.#lastModified.set( url, LAST_MODIFIED.get( headers ) );
            ETAG.has( headers ) && this.#eTag.set( url, ETAG.get( headers ) );
        }
    }
}
