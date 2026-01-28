/**
 * @author Jeff Rose
 */
import { WildcardExp } from '@blue/core';
import ResponseError from './response-error';
import { anyPass, is, like } from '@blue/util';
import { likeResponse } from './like-response';
/**
 * HTTP request Methods
 * @typedef {string} module:http.HTTPMethod
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods}
 */
/**
 * @typedef {RequestInit} module:http.HTTPInit
 * @property {module:http.HTTPMethod} [method] The HTTP request method
 */
/**
 * Interface that allows for the execution of custom behavior after an HTTP request is completed. It executes whether the request was successful or not.
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
 * @param {Request} request The HTTP request
 * @param {Response} response The HTTP response
 */
/**
 * Interface that allows for the execution of custom behavior after an HTTP request fails. If `postError` returns a `Response`, it will be the return value of the request.
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
 * @param {Error} error
 * @param {Request} request
 * @param {module:http.HTTP} http
 * @returns {Promise<external:Response | external:undefined>} An optional response
 */
/**
 * Interface that allows for the execution of custom behavior before an HTTP request is initialized.
 */
/**
 * @param {URL} url
 * @param {module:http.HTTPInit} settings
 * @returns {boolean}
 */
/**
 * Interface that allows for the execution of custom behavior before an HTTP request is executed.
 */
/**
 * @param {Request} request
 * @param {module:http.HTTP} http
 * @returns {Promise<external:Request|void>}
 */
/**
 * Interface that allows for the execution of custom behavior after a response is successfully returned.
 */
/**
 * @param {Response} response
 * @param {module:http.HTTPInit} settings
 * @returns {Promise<void>}
 */
/**
 * Interfaces that allow for customized HTTP execution chains. Any number of inteceptors can be registered to inject behavior at various points in the HTTP request lifecycle.
 * The full set of lifecycle methods and their standard order is:
 * 1. `preInit`
 * 2. `preRequest`
 * 3. `postResponse` or `postError`
 * 5. `postComplete`
 * @typedef {module:http.CompletionAwareHTTPInterceptor|module:http.ErrorAwareHTTPInterceptor|module:http.InitializationAwareHTTPInterceptor|module:http.RequestAwareHTTPInterceptor|external:ResponseAwareHTTPInterceptor} module:http.HTTPInterceptor
 * @see {@link CompletionAwareHTTPInterceptor}
 * @see {@link ErrorAwareHTTPInterceptor}
 * @see {@link InitializationAwareHTTPInterceptor}
 * @see {@link RequestAwareHTTPInterceptor}
 * @see {@link ResponseAwareHTTPInterceptor}
 */
/**
 * @extends module:factory.Aware
 */
/**
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
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link CompletionAwareHTTPInterceptor}.
 */
export const likeCompletionAwareHTTPInterceptor = like({ postComplete: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link ErrorAwareHTTPInterceptor}.
 */
export const likeErrorAwareHTTPInterceptor = like({ postError: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link InitializationAwareHTTPInterceptor}.
 */
export const likeInitializationAwareHTTPInterceptor = like({ preInit: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link RequestAwareHTTPInterceptor}.
 */
export const likeRequestAwareHTTPInterceptor = like({ preRequest: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link external:ResponseAwareHTTPInterceptor}.
 */
export const likeResponseAwareHTTPInterceptor = like({ postResponse: Function });
/**
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is like a {@link HTTPInterceptor}.
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
 */
export class HTTPExecutionChain {
    #interceptors;
    #hasCompletionAwareInterceptors;
    #hasErrorAwareInterceptors;
    #hasInitializationAwareInterceptors;
    #hasRequestAwareInterceptors;
    #hasResponseAwareInterceptors;
    /**
     */
    http;
    /**
     */
    interceptorIndex;
    get [Symbol.toStringTag]() {
        return 'HTTPExecutionChain';
    }
    /**
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
     * @param {Array<module:http.HttpInterceptor>} interceptors
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
 * @param {Array<module:http.HTTPInterceptor>} [interceptors=[]]
 * @param {fetch} [fetch]
 */
export class HTTP {
    #fetch;
    #interceptors;
    settings;
    get [Symbol.toStringTag]() {
        return 'HTTP';
    }
    /**
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
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
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
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async connect(input, init = {}) {
        init ??= {};
        init.method = 'CONNECT';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async delete(input, init = {}) {
        init ??= {};
        init.method = 'DELETE';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async get(input, init = {}) {
        init ??= {};
        init.method = 'GET';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async head(input, init = {}) {
        init ??= {};
        init.method = 'HEAD';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async options(input, init = {}) {
        init ??= {};
        init.method = 'OPTIONS';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async patch(input, init = {}) {
        init ??= {};
        init.method = 'PATCH';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async post(input, init = {}) {
        init ??= {};
        init.method = 'POST';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async put(input, init = {}) {
        init ??= {};
        init.method = 'PUT';
        return this.request(input, init);
    }
    /**
     * @async
     * @param {string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {Promise<external:Response>}
     */
    async trace(input, init = {}) {
        init ??= {};
        init.method = 'TRACE';
        return this.request(input, init);
    }
    /**
     * @protected
     * @param {module:http.HTTP|module:http.HTTPExecutionChain} http
     * @param {string} url
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFrQixXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFekQsT0FBTyxhQUFhLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQy9DLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQXdDL0M7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUVIOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7Ozs7Ozs7O0dBWUc7QUFFSDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7Ozs7Ozs7Ozs7O0dBYUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUgsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUNwQyxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsUUFBUSxHQUFhO0lBQ2pCLEtBQUssRUFBRSxTQUFTO0lBQ2hCLFdBQVcsRUFBRSxhQUFhO0lBQzFCLE1BQU0sRUFBRSxLQUFLO0lBQ2IsSUFBSSxFQUFFLE1BQU07SUFDWixRQUFRLEVBQUUsUUFBUTtDQUNyQixFQUNELFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBdUIsRUFDN0MsU0FBUyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQWdDLENBQUM7QUFFM0Q7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0NBQWtDLEdBQUcsSUFBSSxDQUFDLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxDQUVyQyxDQUFDO0FBRTdDOzs7R0FHRztBQUNILE1BQU0sQ0FB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