/**
 * @author Jeff Rose
 */

import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status}
 */

export interface ResponseCodeAwareHTTPInterceptor {
    [ statusCode: number ]: ( response: Response, settings: HTTPInit ) => Promise<void>;
}

/**
 * @interface module:http.ResponseCodeAwareHTTPInterceptor
 */

/**
 * @class module:http.MappedResponseCodeHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseCodeAwareHTTPInterceptor} interceptor
 */
export class MappedResponseCodeHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #interceptor: ResponseCodeAwareHTTPInterceptor;

    /**
     * @readonly
     * @member {module:http.ResponseCodeAwareHTTPInterceptor} module:http.MappedResponseCodeHTTPInterceptor#interceptor
     */
    get interceptor(){
        return this.#interceptor;
    }

    constructor( interceptor: ResponseCodeAwareHTTPInterceptor ){
        this.#interceptor = interceptor;
    }

    /**
     * @async
     * @function module:http.MappedResponseCodeHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse( response: Response, settings: HTTPInit ): Promise<void> {
        const { status } = response;
        if( status in this.#interceptor ){
            await this.#interceptor[ status ]( response, settings );
        }
    }
}
