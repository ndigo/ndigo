/**
 * @author Jeff Rose
 */
import { PatternMatcher } from '@blue/core';
import { Aware } from '@blue/factory';
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
export type HTTPInterceptor = CompletionAwareHTTPInterceptor | ErrorAwareHTTPInterceptor | InitializationAwareHTTPInterceptor | RequestAwareHTTPInterceptor | ResponseAwareHTTPInterceptor;
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
export declare const assign: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
}, freeze: {
    <T extends Function>(f: T): T;
    <T extends {
        [idx: string]: U | null | undefined | object;
    }, U extends string | bigint | number | boolean | symbol>(o: T): Readonly<T>;
    <T>(o: T): Readonly<T>;
}, defineProperty: typeof Reflect.defineProperty, defaults: HTTPInit, patternCache: Map<string, WildcardExp>, isRequest: (value: any) => value is Request;
/**
 * @function module:http.likeCompletionAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.CompletionAwareHTTPInterceptor}.
 */
export declare const likeCompletionAwareHTTPInterceptor: (value: any) => value is CompletionAwareHTTPInterceptor;
/**
 * @function module:http.likeErrorAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.ErrorAwareHTTPInterceptor}.
 */
export declare const likeErrorAwareHTTPInterceptor: (value: any) => value is ErrorAwareHTTPInterceptor;
/**
 * @function module:http.likeInitializationAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.InitializationAwareHTTPInterceptor}.
 */
export declare const likeInitializationAwareHTTPInterceptor: (value: any) => value is InitializationAwareHTTPInterceptor;
/**
 * @function module:http.likeRequestAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.RequestAwareHTTPInterceptor}.
 */
export declare const likeRequestAwareHTTPInterceptor: (value: any) => value is RequestAwareHTTPInterceptor;
/**
 * @function module:http.likeResponseAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link external:ResponseAwareHTTPInterceptor}.
 */
export declare const likeResponseAwareHTTPInterceptor: (value: any) => value is ResponseAwareHTTPInterceptor;
/**
 * @function module:http.likeHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.HTTPInterceptor}.
 */
export declare const likeHTTPInterceptor: (value: any) => value is ResponseAwareHTTPInterceptor;
export declare class WildcardMatcher implements PatternMatcher<string, string> {
    match(pattern: string, value: string): boolean;
}
/**
 * @class module:http.MappedHTTPInterceptor
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.RequestAwareHTTPInterceptor
 * @implements external:ResponseAwareHTTPInterceptor
 */
export declare class MappedHTTPInterceptor implements CompletionAwareHTTPInterceptor, ErrorAwareHTTPInterceptor, InitializationAwareHTTPInterceptor, RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor {
    #private;
    urlMatcher: WildcardMatcher;
    get interceptor(): HTTPInterceptor;
    constructor(interceptor: HTTPInterceptor, includePatterns: string[], excludePatterns?: string[]);
    matches(url: string, matcher?: WildcardMatcher): boolean;
    postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined>;
    postComplete(request: Request, response: Response): void;
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
    preInit(url: URL, settings: HTTPInit): boolean;
    preRequest(request: Request, http: HTTP): Promise<Request | void>;
    setExcludePatterns(excludePatterns?: string[]): void;
    setIncludePatterns(includePatterns?: string[]): void;
}
/**
 * @class module:http.HTTPExecutionChain
 */
export declare class HTTPExecutionChain {
    #private;
    /**
     * @member {module:http.HTTP} module:http.HTTPExecutionChain#http
     */
    http: HTTP;
    /**
     * @member {exteral:number} module:http.HTTPExecutionChain#interceptorIndex
     */
    interceptorIndex: number;
    get [Symbol.toStringTag](): string;
    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTPExecutionChain#interceptors
     */
    get interceptors(): HTTPInterceptor[];
    constructor(http: HTTP | HTTPExecutionChain, interceptors?: HTTPInterceptor[]);
    /**
     * @function module:http.HttpExecutionChain#addInterceptor
     * @param {module:http.HttpInterceptor} interceptor
     */
    addInterceptor(interceptor: HTTPInterceptor): void;
    /**
     * @function module:http.HttpExecutionChain#addInterceptors
     * @param {external:Array<module:http.HttpInterceptor>} interceptors
     */
    addInterceptors(interceptors: HTTPInterceptor[]): void;
    /**
     * @function module:http.HttpExecutionChain#applyPostError
     */
    applyPostError(error: Error, request: Request, http: HTTP): Promise<Response | undefined>;
    /**
     * @function module:http.HttpExecutionChain#applyPostComplete
     */
    applyPostComplete(request: Request, response: Response): void;
    /**
     * @function module:http.HttpExecutionChain#applyPostSuccess
     */
    applyPostResponse(response: Response, settings: HTTPInit): Promise<void>;
    /**
     * @function module:http.HttpExecutionChain#applyPreInit
     */
    applyPreInit(url: URL, settings: HTTPInit): boolean;
    /**
     * @function module:http.HttpExecutionChain#applyPreRequest
     */
    applyPreRequest(request: Request, http: HTTP): Promise<Request>;
    /**
     * @protected
     * @function module:http.HttpExecutionChain#_checkInterceptorType
     * @param {module:http.HttpInterceptor} interceptor
     */
    _checkInterceptorType(interceptor: HTTPInterceptor): void;
}
/**
 * @class module:http.HTTP
 * @param {external:Array<module:http.HTTPInterceptor>} [interceptors=[]]
 * @param {external:fetch} [fetch]
 */
export declare class HTTP {
    #private;
    settings: HTTPInit;
    get [Symbol.toStringTag](): string;
    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTP#interceptors
     */
    get interceptors(): HTTPInterceptor[];
    constructor(interceptors?: HTTPInterceptor[], init?: HTTPInit, fetch?: any);
    /**
     * @async
     * @function module:http.HTTP#request
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    request(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#connect
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    connect(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#delete
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    delete(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#get
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    get(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#head
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    head(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#options
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    options(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#patch
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    patch(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#post
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    post(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#put
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    put(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @async
     * @function module:http.HTTP#trace
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    trace(input: string, init?: HTTPInit): Promise<Response>;
    /**
     * @protected
     * @function module:http.HTTP#_getHTTPExecutionChain
     * @param {module:http.HTTP|module:http.HTTPExecutionChain} http
     * @param {external:string} url
     * @returns {module:http.HTTPExecutionChain}
     */
    protected _getHTTPExecutionChain(http: HTTP | HTTPExecutionChain, url: string): HTTPExecutionChain;
}
//# sourceMappingURL=http.d.ts.map