/**
 * @author Jeff Rose
 */

import { PatternMatcher, WildcardExp } from '@blue/core';
import { Aware } from '@blue/factory';
import ResponseError from './response-error';
import { anyPass, is, like } from '@blue/util';
import { likeResponse } from './like-response';

export type HTTPMethod = 'CONNECT' | 'DELETE' | 'GET' | 'HEAD' | 'OPTIONS' | 'PATCH' | 'POST' | 'PUT' | 'TRACE';
export type HTTPInit = RequestInit & {
    method?: HTTPMethod;
};

export type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

export interface CompletionAwareHTTPInterceptor {
    postComplete(request: Request, response: Response): void;
}

export interface ErrorAwareHTTPInterceptor {
    postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined>;
}

export interface InitializationAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    preInit(url: URL, settings: T): boolean;
}

export interface RequestAwareHTTPInterceptor {
    preRequest(request: Request, http: HTTP): Promise<Request | void>;
}

export interface ResponseAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    postResponse(response: Response, settings: T): Promise<void>;
}

export type HTTPInterceptor =
    | CompletionAwareHTTPInterceptor
    | ErrorAwareHTTPInterceptor
    | InitializationAwareHTTPInterceptor
    | RequestAwareHTTPInterceptor
    | ResponseAwareHTTPInterceptor;

export interface HTTPAware extends Aware {
    setHTTP(http: HTTP): void;
}

/**
 * HTTP request Methods
 * @typedef {external:string} module:http.HTTPMethod
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */

/**
 * @typedef {external:RequestInit} module:http.HTTPInit
 * @property {module:http.HTTPMethod} [method] The HTTP request method
 */

/**
 * Interface that allows for the execution of custom behavior after an HTTP request is completed. It executes whether the request was successful or not.
 * @interface module:http.CompletionAwareHTTPInterceptor
 * @example
 * class LogInterceptor implements CompletionAwareHTTPInterceptor {
 *  postComplete( request, response ){
 *      console.log( `Completed request ${ request.url }` );
 *  }
 * }
 *
 * const http = new HTTP( [ new LogInterceptor() ] );
 *
 * await const response = http.request( 'https://www.chase.com/' );
 * //=> "Completed request https://www.chase.com/"
 */

/**
 * @function module:http.CompletionAwareHTTPInterceptor#postComplete
 * @param {external:Request} request The HTTP request
 * @param {external:Response} response The HTTP response
 */

/**
 * Interface that allows for the execution of custom behavior after an HTTP request fails. If `postError` returns a `Response`, it will be the return value of the request.
 * @interface module:http.ErrorAwareHTTPInterceptor
 * @example
 * class RetryInterceptor implements ErrorAwareHTTPInterceptor {
 *  postError( error, request, http ){
 *      return http.request( request.url );
 *  }
 * }
 *
 * const http = new HTTP( [ new RetryInterceptor() ] );
 *
 * await const response = http.request( 'https://www.chase123.com/' );
 */

/**
 * @function module:http.ErrorAwareHTTPInterceptor#postError
 * @param {external:Error} error
 * @param {external:Request} request
 * @param {module:http.HTTP} http
 * @returns {external:Promise<external:Response | external:undefined>} An optional response
 */

/**
 * Interface that allows for the execution of custom behavior before an HTTP request is initialized.
 * @interface module:http.InitializationAwareHTTPInterceptor
 */

/**
 * @function module:http.InitializationAwareHTTPInterceptor#preInit
 * @param {external:URL} url
 * @param {module:http.HTTPInit} settings
 * @returns {external:boolean}
 */

/**
 * Interface that allows for the execution of custom behavior before an HTTP request is executed.
 * @interface module:http.RequestAwareHTTPInterceptor
 */

/**
 * @function module:http.RequestAwareHTTPInterceptor#preRequest
 * @param {external:Request} request
 * @param {module:http.HTTP} http
 * @returns {external:Promise<external:Request|void>}
 */

/**
 * Interface that allows for the execution of custom behavior after a response is successfully returned.
 * @interface external:ResponseAwareHTTPInterceptor
 */

/**
 * @function external:ResponseAwareHTTPInterceptor#postResponse
 * @param {external:Response} response
 * @param {module:http.HTTPInit} settings
 * @returns {external:Promise<void>}
 */

/**
 * Interfaces that allow for customized HTTP execution chains. Any number of inteceptors can be registered to inject behavior at various points in the HTTP request lifecycle.
 * The full set of lifecycle methods and their standard order is:
 * 1. `preInit`
 * 2. `preRequest`
 * 3. `postResponse` or `postError`
 * 5. `postComplete`
 * @typedef {module:http.CompletionAwareHTTPInterceptor|module:http.ErrorAwareHTTPInterceptor|module:http.InitializationAwareHTTPInterceptor|module:http.RequestAwareHTTPInterceptor|external:ResponseAwareHTTPInterceptor} module:http.HTTPInterceptor
 * @see {@link module:http.CompletionAwareHTTPInterceptor}
 * @see {@link module:http.ErrorAwareHTTPInterceptor}
 * @see {@link module:http.InitializationAwareHTTPInterceptor}
 * @see {@link module:http.RequestAwareHTTPInterceptor}
 * @see {@link module:http.ResponseAwareHTTPInterceptor}
 */

/**
 * @interface module:http.HTTPAware
 * @extends module:factory.Aware
 */

/**
 * @function module:http.HTTPAware#setHTTP
 * @param {module:http.HTTP} http
 */

export const { assign, freeze } = Object,
    { defineProperty } = Reflect,
    defaults: HTTPInit = {
        cache: 'default',
        credentials: 'same-origin',
        method: 'GET',
        mode: 'cors',
        redirect: 'follow',
    },
    patternCache = new Map<string, WildcardExp>(),
    isRequest = is(Request) as (value) => value is Request;

/**
 * @function module:http.likeCompletionAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.CompletionAwareHTTPInterceptor}.
 */
export const likeCompletionAwareHTTPInterceptor = like({ postComplete: Function }) as (
    value
) => value is CompletionAwareHTTPInterceptor;

/**
 * @function module:http.likeErrorAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.ErrorAwareHTTPInterceptor}.
 */
export const likeErrorAwareHTTPInterceptor = like({ postError: Function }) as (
    value
) => value is ErrorAwareHTTPInterceptor;

/**
 * @function module:http.likeInitializationAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.InitializationAwareHTTPInterceptor}.
 */
export const likeInitializationAwareHTTPInterceptor = like({ preInit: Function }) as (
    value
) => value is InitializationAwareHTTPInterceptor;

/**
 * @function module:http.likeRequestAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.RequestAwareHTTPInterceptor}.
 */
export const likeRequestAwareHTTPInterceptor = like({ preRequest: Function }) as (
    value
) => value is RequestAwareHTTPInterceptor;

/**
 * @function module:http.likeResponseAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link external:ResponseAwareHTTPInterceptor}.
 */
export const likeResponseAwareHTTPInterceptor = like({ postResponse: Function }) as (
    value
) => value is ResponseAwareHTTPInterceptor;

/**
 * @function module:http.likeHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.HTTPInterceptor}.
 */
export const likeHTTPInterceptor = anyPass([
    likeCompletionAwareHTTPInterceptor,
    likeErrorAwareHTTPInterceptor,
    likeInitializationAwareHTTPInterceptor,
    likeRequestAwareHTTPInterceptor,
    likeResponseAwareHTTPInterceptor,
]) as (value) => value is ResponseAwareHTTPInterceptor;

export class WildcardMatcher implements PatternMatcher<string, string> {
    match(pattern: string, value: string): boolean {
        let wcex: WildcardExp;

        if (patternCache.has(pattern)) {
            wcex = patternCache.get(pattern);
        } else {
            wcex = new WildcardExp(pattern);
            patternCache.set(pattern, wcex);
        }

        return wcex.test(value);
    }
}

/**
 * @class module:http.MappedHTTPInterceptor
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.RequestAwareHTTPInterceptor
 * @implements external:ResponseAwareHTTPInterceptor
 */
export class MappedHTTPInterceptor
    implements
        CompletionAwareHTTPInterceptor,
        ErrorAwareHTTPInterceptor,
        InitializationAwareHTTPInterceptor,
        RequestAwareHTTPInterceptor,
        ResponseAwareHTTPInterceptor
{
    #excludePatterns: string[];
    #includePatterns: string[];
    #interceptor: HTTPInterceptor;

    urlMatcher: WildcardMatcher;

    get interceptor(): HTTPInterceptor {
        return this.#interceptor;
    }

    constructor(interceptor: HTTPInterceptor, includePatterns: string[], excludePatterns?: string[]) {
        this.#interceptor = interceptor;
        this.urlMatcher = new WildcardMatcher();
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }

    matches(url: string, matcher?: WildcardMatcher): boolean {
        const urlMatcher = matcher || this.urlMatcher;

        if (urlMatcher) {
            const excludePatterns = this.#excludePatterns ?? [],
                includePatterns = this.#includePatterns ?? [];
            let index: number, length: number;

            if (excludePatterns.length) {
                length = excludePatterns.length;
                for (index = 0; index < length; index++) {
                    if (urlMatcher.match(excludePatterns[index], url)) {
                        return false;
                    }
                }
            }

            if (!includePatterns.length) {
                return true;
            }

            length = includePatterns.length;
            for (index = 0; index < length; index++) {
                if (urlMatcher.match(includePatterns[index], url)) {
                    return true;
                }
            }
        }

        return false;
    }

    async postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        const interceptor = this.#interceptor;
        if (likeErrorAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postError(error, request, http);
        }
    }

    postComplete(request: Request, response: Response): void {
        const interceptor = this.#interceptor;
        if (likeCompletionAwareHTTPInterceptor(interceptor)) {
            interceptor.postComplete(request, response);
        }
    }

    async postResponse(response: Response, settings: HTTPInit): Promise<void> {
        const interceptor = this.#interceptor;
        if (likeResponseAwareHTTPInterceptor(interceptor)) {
            await interceptor.postResponse(response, settings);
        }
    }

    preInit(url: URL, settings: HTTPInit): boolean {
        const interceptor = this.#interceptor;
        if (likeInitializationAwareHTTPInterceptor(interceptor)) {
            return interceptor.preInit(url, settings);
        }
        return true;
    }

    async preRequest(request: Request, http: HTTP): Promise<Request | void> {
        const interceptor = this.#interceptor;
        if (likeRequestAwareHTTPInterceptor(interceptor)) {
            return interceptor.preRequest(request, http);
        }
        return request;
    }

    setExcludePatterns(excludePatterns: string[] = []): void {
        this.#excludePatterns = excludePatterns;
    }

    setIncludePatterns(includePatterns: string[] = []): void {
        this.#includePatterns = includePatterns;
    }
}

const isMappedHTTPInterceptor = is(MappedHTTPInterceptor) as (value) => value is MappedHTTPInterceptor;

/**
 * @class module:http.HTTPExecutionChain
 */
export class HTTPExecutionChain {
    #interceptors: HTTPInterceptor[];

    #hasCompletionAwareInterceptors: boolean;
    #hasErrorAwareInterceptors: boolean;
    #hasInitializationAwareInterceptors: boolean;
    #hasRequestAwareInterceptors: boolean;
    #hasResponseAwareInterceptors: boolean;

    /**
     * @member {module:http.HTTP} module:http.HTTPExecutionChain#http
     */
    http: HTTP;

    /**
     * @member {exteral:number} module:http.HTTPExecutionChain#interceptorIndex
     */
    interceptorIndex: number;

    get [Symbol.toStringTag](): string {
        return 'HTTPExecutionChain';
    }

    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTPExecutionChain#interceptors
     */
    get interceptors(): HTTPInterceptor[] {
        return this.#interceptors;
    }

    constructor(http: HTTP | HTTPExecutionChain, interceptors: HTTPInterceptor[] = null) {
        this.#hasCompletionAwareInterceptors = false;
        this.#hasErrorAwareInterceptors = false;
        this.#hasInitializationAwareInterceptors = false;
        this.#hasRequestAwareInterceptors = false;
        this.#hasResponseAwareInterceptors = false;

        this.#interceptors = null;

        if (isHTTPExecutionChain(http)) {
            const chain = http;
            this.http = chain.http;
            chain.interceptors?.length && this.addInterceptors(chain.interceptors);
        } else {
            this.http = http;
            interceptors?.length && this.addInterceptors(interceptors);
        }

        this.interceptorIndex = -1;
    }

    /**
     * @function module:http.HttpExecutionChain#addInterceptor
     * @param {module:http.HttpInterceptor} interceptor
     */
    addInterceptor(interceptor: HTTPInterceptor): void {
        if (interceptor) {
            if (!this.#interceptors) {
                this.#interceptors = [];
            }
            this._checkInterceptorType(interceptor);
            this.#interceptors.push(interceptor);
        }
    }

    /**
     * @function module:http.HttpExecutionChain#addInterceptors
     * @param {external:Array<module:http.HttpInterceptor>} interceptors
     */
    addInterceptors(interceptors: HTTPInterceptor[]): void {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }

    /**
     * @function module:http.HttpExecutionChain#applyPostError
     */
    async applyPostError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        if (this.#hasErrorAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeErrorAwareHTTPInterceptor(interceptor)) {
                        return await interceptor.postError(error, request, http);
                    }
                }
            }
        }
    }

    /**
     * @function module:http.HttpExecutionChain#applyPostComplete
     */
    applyPostComplete(request: Request, response: Response): void {
        if (this.#hasCompletionAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeCompletionAwareHTTPInterceptor(interceptor)) {
                        interceptor.postComplete(request, response);
                    }
                }
            }
        }
    }

    /**
     * @function module:http.HttpExecutionChain#applyPostSuccess
     */
    async applyPostResponse(response: Response, settings: HTTPInit): Promise<void> {
        if (this.#hasResponseAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeResponseAwareHTTPInterceptor(interceptor)) {
                        await interceptor.postResponse(response, settings);
                    }
                }
            }
        }
    }

    /**
     * @function module:http.HttpExecutionChain#applyPreInit
     */
    applyPreInit(url: URL, settings: HTTPInit): boolean {
        if (this.#hasInitializationAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeInitializationAwareHTTPInterceptor(interceptor)) {
                        if (interceptor.preInit(url, settings) === false) {
                            return false;
                        }
                        this.interceptorIndex = index;
                    }
                }
            }
        }
        return true;
    }

    /**
     * @function module:http.HttpExecutionChain#applyPreRequest
     */
    async applyPreRequest(request: Request, http: HTTP): Promise<Request> {
        if (this.#hasRequestAwareInterceptors) {
            const interceptors = this.#interceptors,
                length = interceptors.length;
            let index = 0;
            if (length) {
                let currentRequest = request;
                for (; index < length; index++) {
                    const interceptor = interceptors[index];
                    if (likeRequestAwareHTTPInterceptor(interceptor)) {
                        const newRequest = await interceptor.preRequest(currentRequest, http);
                        if (isRequest(newRequest)) {
                            currentRequest = newRequest;
                        }
                    }
                }
                return currentRequest;
            }
        }
        return request;
    }

    /**
     * @protected
     * @function module:http.HttpExecutionChain#_checkInterceptorType
     * @param {module:http.HttpInterceptor} interceptor
     */
    _checkInterceptorType(interceptor: HTTPInterceptor): void {
        if (!this.#hasCompletionAwareInterceptors) {
            this.#hasCompletionAwareInterceptors = likeCompletionAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasErrorAwareInterceptors) {
            this.#hasErrorAwareInterceptors = likeErrorAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasInitializationAwareInterceptors) {
            this.#hasInitializationAwareInterceptors = likeInitializationAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasRequestAwareInterceptors) {
            this.#hasRequestAwareInterceptors = likeRequestAwareHTTPInterceptor(interceptor);
        }
        if (!this.#hasResponseAwareInterceptors) {
            this.#hasResponseAwareInterceptors = likeResponseAwareHTTPInterceptor(interceptor);
        }
    }
}

const isHTTPExecutionChain = is(HTTPExecutionChain) as (value) => value is HTTPExecutionChain;

/**
 * @class module:http.HTTP
 * @param {external:Array<module:http.HTTPInterceptor>} [interceptors=[]]
 * @param {external:fetch} [fetch]
 */
export class HTTP {
    #fetch: Fetch;
    #interceptors: HTTPInterceptor[];
    settings: HTTPInit;

    get [Symbol.toStringTag](): string {
        return 'HTTP';
    }

    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTP#interceptors
     */
    get interceptors(): HTTPInterceptor[] {
        return this.#interceptors;
    }

    constructor(
        interceptors: HTTPInterceptor[] = [],
        init: HTTPInit = defaults,
        fetch = globalThis.fetch.bind(globalThis)
    ) {
        this.#interceptors = interceptors;
        this.#fetch = fetch;
        this.settings = init === defaults ? assign({}, init) : assign({}, defaults, init);
    }

    /**
     * @async
     * @function module:http.HTTP#request
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async request(input: string, init: HTTPInit = null): Promise<Response> {
        const settings = init === null ? assign({}, this.settings) : assign({}, this.settings, init),
            url = new URL(input, location.href);

        let response: Response;

        // No interceptors, so simplify execution
        if (!this.#interceptors.length) {
            freeze(settings);

            const request = new Request(url.toString(), settings);
            try {
                response = await this.#fetch(request);
            } catch (error) {
                response = new ResponseError(null, error);
            }

            // One or more interceptors, so complex execution
        } else {
            const chain = this._getHTTPExecutionChain(this, input);

            if (chain.applyPreInit(url, settings) === false) {
                return new Response(null, settings);
            }

            freeze(settings);

            const request = await chain.applyPreRequest(new Request(url.toString(), settings), this);
            try {
                response = await this.#fetch(request);
                await chain.applyPostResponse(response, settings);
            } catch (error) {
                response = await chain.applyPostError(error, request, this);

                if (!likeResponse(response)) {
                    response = likeResponse(error) ? error : new ResponseError(null, error);
                }
            } finally {
                chain.applyPostComplete(request, response);
            }
        }

        return response;
    }

    /**
     * @async
     * @function module:http.HTTP#connect
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async connect(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'CONNECT';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#delete
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async delete(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'DELETE';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#get
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async get(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'GET';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#head
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async head(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'HEAD';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#options
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async options(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'OPTIONS';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#patch
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async patch(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'PATCH';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#post
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async post(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'POST';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#put
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async put(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'PUT';
        return this.request(input, init);
    }

    /**
     * @async
     * @function module:http.HTTP#trace
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async trace(input: string, init: HTTPInit = {}): Promise<Response> {
        init ??= {};
        init.method = 'TRACE';
        return this.request(input, init);
    }

    /**
     * @protected
     * @function module:http.HTTP#_getHTTPExecutionChain
     * @param {module:http.HTTP|module:http.HTTPExecutionChain} http
     * @param {external:string} url
     * @returns {module:http.HTTPExecutionChain}
     */
    protected _getHTTPExecutionChain(http: HTTP | HTTPExecutionChain, url: string): HTTPExecutionChain {
        const chain = isHTTPExecutionChain(http) ? http : new HTTPExecutionChain(http),
            interceptors = this.#interceptors,
            length = interceptors?.length;

        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (isMappedHTTPInterceptor(interceptor)) {
                    if (interceptor.matches(url)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                } else {
                    chain.addInterceptor(interceptor);
                }
            }
        }

        return chain;
    }
}
