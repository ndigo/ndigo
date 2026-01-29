/**
 * @author Jeff Rose
 */
import { WildcardExp } from '@blue/core';
import ResponseError from './response-error';
import { anyPass } from '@blue/util/logic';
import { is, like } from '@blue/util/types';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFrQixXQUFXLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFekQsT0FBTyxhQUFhLE1BQU0sa0JBQWtCLENBQUM7QUFDN0MsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDNUMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBd0MvQzs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUVIOzs7R0FHRztBQUVIOzs7Ozs7Ozs7Ozs7R0FZRztBQUVIOzs7OztHQUtHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSCxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQ3BDLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixRQUFRLEdBQWE7SUFDakIsS0FBSyxFQUFFLFNBQVM7SUFDaEIsV0FBVyxFQUFFLGFBQWE7SUFDMUIsTUFBTSxFQUFFLEtBQUs7SUFDYixJQUFJLEVBQUUsTUFBTTtJQUNaLFFBQVEsRUFBRSxRQUFRO0NBQ3JCLEVBQ0QsWUFBWSxHQUFHLElBQUksR0FBRyxFQUF1QixFQUM3QyxTQUFTLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBZ0MsQ0FBQztBQUUzRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLENB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