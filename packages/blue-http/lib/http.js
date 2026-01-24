/**
 * @author Jeff Rose
 */
import { WildcardExp } from '@blue/core';
import ResponseError from './response-error';
import { anyPass, is, like } from '@blue/util';
import { likeResponse } from './like-response';
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
export const { assign, freeze } = Object, { defineProperty } = Reflect, defaults = {
    cache: 'default',
    credentials: 'same-origin',
    method: 'GET',
    mode: 'cors',
    redirect: 'follow',
}, patternCache = new Map(), isRequest = is(Request);
/**
 * @function module:http.likeCompletionAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.CompletionAwareHTTPInterceptor}.
 */
export const likeCompletionAwareHTTPInterceptor = like({ postComplete: Function });
/**
 * @function module:http.likeErrorAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.ErrorAwareHTTPInterceptor}.
 */
export const likeErrorAwareHTTPInterceptor = like({ postError: Function });
/**
 * @function module:http.likeInitializationAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.InitializationAwareHTTPInterceptor}.
 */
export const likeInitializationAwareHTTPInterceptor = like({ preInit: Function });
/**
 * @function module:http.likeRequestAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.RequestAwareHTTPInterceptor}.
 */
export const likeRequestAwareHTTPInterceptor = like({ preRequest: Function });
/**
 * @function module:http.likeResponseAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link external:ResponseAwareHTTPInterceptor}.
 */
export const likeResponseAwareHTTPInterceptor = like({ postResponse: Function });
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
]);
export class WildcardMatcher {
    match(pattern, value) {
        let wcex;
        if (patternCache.has(pattern)) {
            wcex = patternCache.get(pattern);
        }
        else {
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
export class MappedHTTPInterceptor {
    #excludePatterns;
    #includePatterns;
    #interceptor;
    urlMatcher;
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor, includePatterns, excludePatterns) {
        this.#interceptor = interceptor;
        this.urlMatcher = new WildcardMatcher();
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }
    matches(url, matcher) {
        const urlMatcher = matcher || this.urlMatcher;
        if (urlMatcher) {
            const excludePatterns = this.#excludePatterns ?? [], includePatterns = this.#includePatterns ?? [];
            let index, length;
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
    async postError(error, request, http) {
        const interceptor = this.#interceptor;
        if (likeErrorAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postError(error, request, http);
        }
    }
    postComplete(request, response) {
        const interceptor = this.#interceptor;
        if (likeCompletionAwareHTTPInterceptor(interceptor)) {
            interceptor.postComplete(request, response);
        }
    }
    async postResponse(response, settings) {
        const interceptor = this.#interceptor;
        if (likeResponseAwareHTTPInterceptor(interceptor)) {
            await interceptor.postResponse(response, settings);
        }
    }
    preInit(url, settings) {
        const interceptor = this.#interceptor;
        if (likeInitializationAwareHTTPInterceptor(interceptor)) {
            return interceptor.preInit(url, settings);
        }
        return true;
    }
    async preRequest(request, http) {
        const interceptor = this.#interceptor;
        if (likeRequestAwareHTTPInterceptor(interceptor)) {
            return interceptor.preRequest(request, http);
        }
        return request;
    }
    setExcludePatterns(excludePatterns = []) {
        this.#excludePatterns = excludePatterns;
    }
    setIncludePatterns(includePatterns = []) {
        this.#includePatterns = includePatterns;
    }
}
const isMappedHTTPInterceptor = is(MappedHTTPInterceptor);
/**
 * @class module:http.HTTPExecutionChain
 */
export class HTTPExecutionChain {
    #interceptors;
    #hasCompletionAwareInterceptors;
    #hasErrorAwareInterceptors;
    #hasInitializationAwareInterceptors;
    #hasRequestAwareInterceptors;
    #hasResponseAwareInterceptors;
    /**
     * @member {module:http.HTTP} module:http.HTTPExecutionChain#http
     */
    http;
    /**
     * @member {exteral:number} module:http.HTTPExecutionChain#interceptorIndex
     */
    interceptorIndex;
    get [Symbol.toStringTag]() {
        return 'HTTPExecutionChain';
    }
    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTPExecutionChain#interceptors
     */
    get interceptors() {
        return this.#interceptors;
    }
    constructor(http, interceptors = null) {
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
        }
        else {
            this.http = http;
            interceptors?.length && this.addInterceptors(interceptors);
        }
        this.interceptorIndex = -1;
    }
    /**
     * @function module:http.HttpExecutionChain#addInterceptor
     * @param {module:http.HttpInterceptor} interceptor
     */
    addInterceptor(interceptor) {
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
    addInterceptors(interceptors) {
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
    async applyPostError(error, request, http) {
        if (this.#hasErrorAwareInterceptors) {
            const interceptors = this.#interceptors, length = interceptors.length;
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
    applyPostComplete(request, response) {
        if (this.#hasCompletionAwareInterceptors) {
            const interceptors = this.#interceptors, length = interceptors.length;
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
    async applyPostResponse(response, settings) {
        if (this.#hasResponseAwareInterceptors) {
            const interceptors = this.#interceptors, length = interceptors.length;
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
    applyPreInit(url, settings) {
        if (this.#hasInitializationAwareInterceptors) {
            const interceptors = this.#interceptors, length = interceptors.length;
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
    async applyPreRequest(request, http) {
        if (this.#hasRequestAwareInterceptors) {
            const interceptors = this.#interceptors, length = interceptors.length;
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
    _checkInterceptorType(interceptor) {
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
const isHTTPExecutionChain = is(HTTPExecutionChain);
/**
 * @class module:http.HTTP
 * @param {external:Array<module:http.HTTPInterceptor>} [interceptors=[]]
 * @param {external:fetch} [fetch]
 */
export class HTTP {
    #fetch;
    #interceptors;
    settings;
    get [Symbol.toStringTag]() {
        return 'HTTP';
    }
    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTP#interceptors
     */
    get interceptors() {
        return this.#interceptors;
    }
    constructor(interceptors = [], init = defaults, fetch = globalThis.fetch.bind(globalThis)) {
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
    async request(input, init = null) {
        const settings = init === null ? assign({}, this.settings) : assign({}, this.settings, init), url = new URL(input, location.href);
        let response;
        // No interceptors, so simplify execution
        if (!this.#interceptors.length) {
            freeze(settings);
            const request = new Request(url.toString(), settings);
            try {
                response = await this.#fetch(request);
            }
            catch (error) {
                response = new ResponseError(null, error);
            }
            // One or more interceptors, so complex execution
        }
        else {
            const chain = this._getHTTPExecutionChain(this, input);
            if (chain.applyPreInit(url, settings) === false) {
                return new Response(null, settings);
            }
            freeze(settings);
            const request = await chain.applyPreRequest(new Request(url.toString(), settings), this);
            try {
                response = await this.#fetch(request);
                await chain.applyPostResponse(response, settings);
            }
            catch (error) {
                response = await chain.applyPostError(error, request, this);
                if (!likeResponse(response)) {
                    response = likeResponse(error) ? error : new ResponseError(null, error);
                }
            }
            finally {
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
    async connect(input, init = {}) {
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
    async delete(input, init = {}) {
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
    async get(input, init = {}) {
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
    async head(input, init = {}) {
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
    async options(input, init = {}) {
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
    async patch(input, init = {}) {
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
    async post(input, init = {}) {
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
    async put(input, init = {}) {
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
    async trace(input, init = {}) {
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
    _getHTTPExecutionChain(http, url) {
        const chain = isHTTPExecutionChain(http) ? http : new HTTPExecutionChain(http), interceptors = this.#interceptors, length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (isMappedHTTPInterceptor(interceptor)) {
                    if (interceptor.matches(url)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                }
                else {
                    chain.addInterceptor(interceptor);
                }
            }
        }
        return chain;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFrQixXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFekQsT0FBTyxhQUFhLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQXdDL0M7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUVIOzs7Ozs7Ozs7Ozs7OztHQWNHO0FBRUg7Ozs7R0FJRztBQUVIOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBRUg7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7Ozs7Ozs7Ozs7OztHQWFHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUNwQyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsUUFBUSxHQUFhO0lBQ2pCLEtBQUssRUFBRSxTQUFTO0lBQ2hCLFdBQVcsRUFBRSxhQUFhO0lBQzFCLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLE1BQU07SUFDWixRQUFRLEVBQUUsUUFBUTtDQUNyQixFQUNELFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBdUIsRUFDN0MsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQWdDLENBQUM7QUFFM0Q7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtDQUFrQyxHQUFHLElBQUksQ0FBQyxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FFckMsQ0FBQztBQUU3Qzs7OztHQUlH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QyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFhLEVBQUUsT0FBaUIsRUFBRTtRQUN6QyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFhLEVBQUUsT0FBaUIsRUFBRTtRQUM1QyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFhLEVBQUUsT0FBaUIsRUFBRTtRQUMxQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFhLEVBQUUsT0FBaUIsRUFBRTtRQUN6QyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFhLEVBQUUsT0FBaUIsRUFBRTtRQUN4QyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFhLEVBQUUsT0FBaUIsRUFBRTtRQUMxQyxJQUFJLEtBQUssRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUM7UUFDdEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ08sc0JBQXNCLENBQUMsSUFBK0IsRUFBRSxHQUFXO1FBQ3pFLE1BQU0sS0FBSyxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDLEVBQzFFLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUNqQyxNQUFNLEdBQUcsWUFBWSxFQUFFLE1BQU0sQ0FBQztRQUVsQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUMxQyxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3hDLElBQUksdUJBQXVCLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztvQkFDdkMsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7d0JBQzNCLEtBQUssQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNsRCxDQUFDO2dCQUNMLENBQUM7cUJBQU0sQ0FBQztvQkFDSixLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN0QyxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0NBQ0oifQ==