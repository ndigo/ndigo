(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@blue/core"), require("@blue/util"), require("@blue/parser"));
	else if(typeof define === 'function' && define.amd)
		define(["@blue/core", "@blue/util", "@blue/parser"], factory);
	else if(typeof exports === 'object')
		exports["blue-http"] = factory(require("@blue/core"), require("@blue/util"), require("@blue/parser"));
	else
		root["blue-http"] = factory(root["@blue/core"], root["@blue/util"], root["@blue/parser"]);
})(globalThis, (__WEBPACK_EXTERNAL_MODULE__2__, __WEBPACK_EXTERNAL_MODULE__3__, __WEBPACK_EXTERNAL_MODULE__17__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HTTP": () => (/* binding */ HTTP),
/* harmony export */   "HTTPExecutionChain": () => (/* binding */ HTTPExecutionChain),
/* harmony export */   "MappedHTTPInterceptor": () => (/* binding */ MappedHTTPInterceptor),
/* harmony export */   "WildcardMatcher": () => (/* binding */ WildcardMatcher),
/* harmony export */   "assign": () => (/* binding */ assign),
/* harmony export */   "defaults": () => (/* binding */ defaults),
/* harmony export */   "defineProperty": () => (/* binding */ defineProperty),
/* harmony export */   "freeze": () => (/* binding */ freeze),
/* harmony export */   "isRequest": () => (/* binding */ isRequest),
/* harmony export */   "likeCompletionAwareHTTPInterceptor": () => (/* binding */ likeCompletionAwareHTTPInterceptor),
/* harmony export */   "likeErrorAwareHTTPInterceptor": () => (/* binding */ likeErrorAwareHTTPInterceptor),
/* harmony export */   "likeHTTPInterceptor": () => (/* binding */ likeHTTPInterceptor),
/* harmony export */   "likeInitializationAwareHTTPInterceptor": () => (/* binding */ likeInitializationAwareHTTPInterceptor),
/* harmony export */   "likeRequestAwareHTTPInterceptor": () => (/* binding */ likeRequestAwareHTTPInterceptor),
/* harmony export */   "likeResponseAwareHTTPInterceptor": () => (/* binding */ likeResponseAwareHTTPInterceptor),
/* harmony export */   "patternCache": () => (/* binding */ patternCache)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _response_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _like_response__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MappedHTTPInterceptor_excludePatterns, _MappedHTTPInterceptor_includePatterns, _MappedHTTPInterceptor_interceptor, _HTTPExecutionChain_interceptors, _HTTPExecutionChain_hasCompletionAwareInterceptors, _HTTPExecutionChain_hasErrorAwareInterceptors, _HTTPExecutionChain_hasInitializationAwareInterceptors, _HTTPExecutionChain_hasRequestAwareInterceptors, _HTTPExecutionChain_hasResponseAwareInterceptors, _HTTP_fetch, _HTTP_interceptors;




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
const { assign, freeze } = Object, { defineProperty } = Reflect, defaults = {
    cache: 'default',
    credentials: 'same-origin',
    method: 'GET',
    mode: 'cors',
    redirect: 'follow'
}, patternCache = new Map(), isRequest = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(Request);
/**
 * @function module:http.likeCompletionAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.CompletionAwareHTTPInterceptor}.
 */
const likeCompletionAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ postComplete: Function });
/**
 * @function module:http.likeErrorAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.ErrorAwareHTTPInterceptor}.
 */
const likeErrorAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ postError: Function });
/**
 * @function module:http.likeInitializationAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.InitializationAwareHTTPInterceptor}.
 */
const likeInitializationAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ preInit: Function });
/**
 * @function module:http.likeRequestAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.RequestAwareHTTPInterceptor}.
 */
const likeRequestAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ preRequest: Function });
/**
 * @function module:http.likeResponseAwareHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link external:ResponseAwareHTTPInterceptor}.
 */
const likeResponseAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.like)({ postResponse: Function });
/**
 * @function module:http.likeHTTPInterceptor
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the value is like a {@link module:http.HTTPInterceptor}.
 */
const likeHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.anyPass)([likeCompletionAwareHTTPInterceptor, likeErrorAwareHTTPInterceptor, likeInitializationAwareHTTPInterceptor, likeRequestAwareHTTPInterceptor, likeResponseAwareHTTPInterceptor]);
class WildcardMatcher {
    match(pattern, value) {
        let wcex;
        if (patternCache.has(pattern)) {
            wcex = patternCache.get(pattern);
        }
        else {
            wcex = new _blue_core__WEBPACK_IMPORTED_MODULE_0__.WildcardExp(pattern);
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
class MappedHTTPInterceptor {
    constructor(interceptor, includePatterns, excludePatterns) {
        _MappedHTTPInterceptor_excludePatterns.set(this, void 0);
        _MappedHTTPInterceptor_includePatterns.set(this, void 0);
        _MappedHTTPInterceptor_interceptor.set(this, void 0);
        __classPrivateFieldSet(this, _MappedHTTPInterceptor_interceptor, interceptor, "f");
        this.urlMatcher = new WildcardMatcher();
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }
    get interceptor() {
        return __classPrivateFieldGet(this, _MappedHTTPInterceptor_interceptor, "f");
    }
    matches(url, matcher) {
        var _a, _b;
        const urlMatcher = matcher || this.urlMatcher;
        if (urlMatcher) {
            const excludePatterns = (_a = __classPrivateFieldGet(this, _MappedHTTPInterceptor_excludePatterns, "f")) !== null && _a !== void 0 ? _a : [], includePatterns = (_b = __classPrivateFieldGet(this, _MappedHTTPInterceptor_includePatterns, "f")) !== null && _b !== void 0 ? _b : [];
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
        const interceptor = __classPrivateFieldGet(this, _MappedHTTPInterceptor_interceptor, "f");
        if (likeErrorAwareHTTPInterceptor(interceptor)) {
            return await interceptor.postError(error, request, http);
        }
    }
    postComplete(request, response) {
        const interceptor = __classPrivateFieldGet(this, _MappedHTTPInterceptor_interceptor, "f");
        if (likeCompletionAwareHTTPInterceptor(interceptor)) {
            interceptor.postComplete(request, response);
        }
    }
    async postResponse(response, settings) {
        const interceptor = __classPrivateFieldGet(this, _MappedHTTPInterceptor_interceptor, "f");
        if (likeResponseAwareHTTPInterceptor(interceptor)) {
            await interceptor.postResponse(response, settings);
        }
    }
    preInit(url, settings) {
        const interceptor = __classPrivateFieldGet(this, _MappedHTTPInterceptor_interceptor, "f");
        if (likeInitializationAwareHTTPInterceptor(interceptor)) {
            return interceptor.preInit(url, settings);
        }
        return true;
    }
    async preRequest(request, http) {
        const interceptor = __classPrivateFieldGet(this, _MappedHTTPInterceptor_interceptor, "f");
        if (likeRequestAwareHTTPInterceptor(interceptor)) {
            return interceptor.preRequest(request, http);
        }
        return request;
    }
    setExcludePatterns(excludePatterns = []) {
        __classPrivateFieldSet(this, _MappedHTTPInterceptor_excludePatterns, excludePatterns, "f");
    }
    setIncludePatterns(includePatterns = []) {
        __classPrivateFieldSet(this, _MappedHTTPInterceptor_includePatterns, includePatterns, "f");
    }
}
_MappedHTTPInterceptor_excludePatterns = new WeakMap(), _MappedHTTPInterceptor_includePatterns = new WeakMap(), _MappedHTTPInterceptor_interceptor = new WeakMap();
const isMappedHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(MappedHTTPInterceptor);
/**
 * @class module:http.HTTPExecutionChain
 */
class HTTPExecutionChain {
    constructor(http, interceptors = null) {
        var _a;
        _HTTPExecutionChain_interceptors.set(this, void 0);
        _HTTPExecutionChain_hasCompletionAwareInterceptors.set(this, void 0);
        _HTTPExecutionChain_hasErrorAwareInterceptors.set(this, void 0);
        _HTTPExecutionChain_hasInitializationAwareInterceptors.set(this, void 0);
        _HTTPExecutionChain_hasRequestAwareInterceptors.set(this, void 0);
        _HTTPExecutionChain_hasResponseAwareInterceptors.set(this, void 0);
        __classPrivateFieldSet(this, _HTTPExecutionChain_hasCompletionAwareInterceptors, false, "f");
        __classPrivateFieldSet(this, _HTTPExecutionChain_hasErrorAwareInterceptors, false, "f");
        __classPrivateFieldSet(this, _HTTPExecutionChain_hasInitializationAwareInterceptors, false, "f");
        __classPrivateFieldSet(this, _HTTPExecutionChain_hasRequestAwareInterceptors, false, "f");
        __classPrivateFieldSet(this, _HTTPExecutionChain_hasResponseAwareInterceptors, false, "f");
        __classPrivateFieldSet(this, _HTTPExecutionChain_interceptors, null, "f");
        if (isHTTPExecutionChain(http)) {
            const chain = http;
            this.http = chain.http;
            ((_a = chain.interceptors) === null || _a === void 0 ? void 0 : _a.length) && this.addInterceptors(chain.interceptors);
        }
        else {
            this.http = http;
            (interceptors === null || interceptors === void 0 ? void 0 : interceptors.length) && this.addInterceptors(interceptors);
        }
        this.interceptorIndex = -1;
    }
    get [(_HTTPExecutionChain_interceptors = new WeakMap(), _HTTPExecutionChain_hasCompletionAwareInterceptors = new WeakMap(), _HTTPExecutionChain_hasErrorAwareInterceptors = new WeakMap(), _HTTPExecutionChain_hasInitializationAwareInterceptors = new WeakMap(), _HTTPExecutionChain_hasRequestAwareInterceptors = new WeakMap(), _HTTPExecutionChain_hasResponseAwareInterceptors = new WeakMap(), Symbol.toStringTag)]() {
        return 'HTTPExecutionChain';
    }
    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTPExecutionChain#interceptors
     */
    get interceptors() {
        return __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f");
    }
    /**
     * @function module:http.HttpExecutionChain#addInterceptor
     * @param {module:http.HttpInterceptor} interceptor
     */
    addInterceptor(interceptor) {
        if (interceptor) {
            if (!__classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f")) {
                __classPrivateFieldSet(this, _HTTPExecutionChain_interceptors, [], "f");
            }
            this._checkInterceptorType(interceptor);
            __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f").push(interceptor);
        }
    }
    /**
     * @function module:http.HttpExecutionChain#addInterceptors
     * @param {external:Array<module:http.HttpInterceptor>} interceptors
     */
    addInterceptors(interceptors) {
        const length = interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
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
        if (__classPrivateFieldGet(this, _HTTPExecutionChain_hasErrorAwareInterceptors, "f")) {
            const interceptors = __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f"), length = interceptors.length;
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
        if (__classPrivateFieldGet(this, _HTTPExecutionChain_hasCompletionAwareInterceptors, "f")) {
            const interceptors = __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f"), length = interceptors.length;
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
        if (__classPrivateFieldGet(this, _HTTPExecutionChain_hasResponseAwareInterceptors, "f")) {
            const interceptors = __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f"), length = interceptors.length;
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
        if (__classPrivateFieldGet(this, _HTTPExecutionChain_hasInitializationAwareInterceptors, "f")) {
            const interceptors = __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f"), length = interceptors.length;
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
        if (__classPrivateFieldGet(this, _HTTPExecutionChain_hasRequestAwareInterceptors, "f")) {
            const interceptors = __classPrivateFieldGet(this, _HTTPExecutionChain_interceptors, "f"), length = interceptors.length;
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
        if (!__classPrivateFieldGet(this, _HTTPExecutionChain_hasCompletionAwareInterceptors, "f")) {
            __classPrivateFieldSet(this, _HTTPExecutionChain_hasCompletionAwareInterceptors, likeCompletionAwareHTTPInterceptor(interceptor), "f");
        }
        if (!__classPrivateFieldGet(this, _HTTPExecutionChain_hasErrorAwareInterceptors, "f")) {
            __classPrivateFieldSet(this, _HTTPExecutionChain_hasErrorAwareInterceptors, likeErrorAwareHTTPInterceptor(interceptor), "f");
        }
        if (!__classPrivateFieldGet(this, _HTTPExecutionChain_hasInitializationAwareInterceptors, "f")) {
            __classPrivateFieldSet(this, _HTTPExecutionChain_hasInitializationAwareInterceptors, likeInitializationAwareHTTPInterceptor(interceptor), "f");
        }
        if (!__classPrivateFieldGet(this, _HTTPExecutionChain_hasRequestAwareInterceptors, "f")) {
            __classPrivateFieldSet(this, _HTTPExecutionChain_hasRequestAwareInterceptors, likeRequestAwareHTTPInterceptor(interceptor), "f");
        }
        if (!__classPrivateFieldGet(this, _HTTPExecutionChain_hasResponseAwareInterceptors, "f")) {
            __classPrivateFieldSet(this, _HTTPExecutionChain_hasResponseAwareInterceptors, likeResponseAwareHTTPInterceptor(interceptor), "f");
        }
    }
}
const isHTTPExecutionChain = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(HTTPExecutionChain);
/**
 * @class module:http.HTTP
 * @param {external:Array<module:http.HTTPInterceptor>} [interceptors=[]]
 * @param {external:fetch} [fetch]
 */
class HTTP {
    constructor(interceptors = [], init = defaults, fetch = globalThis.fetch.bind(globalThis)) {
        _HTTP_fetch.set(this, void 0);
        _HTTP_interceptors.set(this, void 0);
        __classPrivateFieldSet(this, _HTTP_interceptors, interceptors, "f");
        __classPrivateFieldSet(this, _HTTP_fetch, fetch, "f");
        this.settings = init === defaults ?
            assign({}, init) :
            assign({}, defaults, init);
    }
    get [(_HTTP_fetch = new WeakMap(), _HTTP_interceptors = new WeakMap(), Symbol.toStringTag)]() {
        return 'HTTP';
    }
    /**
     * @member {external:Array<module:http.HTTPInterceptor>} module:http.HTTP#interceptors
     */
    get interceptors() {
        return __classPrivateFieldGet(this, _HTTP_interceptors, "f");
    }
    /**
     * @async
     * @function module:http.HTTP#request
     * @param {external:string} input
     * @param {module:http.HTTPInit} [init={}]
     * @returns {external:Promise<external:Response>}
     */
    async request(input, init = null) {
        const settings = init === null ?
            assign({}, this.settings) :
            assign({}, this.settings, init), url = new URL(input, location.href);
        let response;
        // No interceptors, so simplify execution
        if (!__classPrivateFieldGet(this, _HTTP_interceptors, "f").length) {
            freeze(settings);
            const request = new Request(url.toString(), settings);
            try {
                response = await __classPrivateFieldGet(this, _HTTP_fetch, "f").call(this, request);
            }
            catch (error) {
                response = new _response_error__WEBPACK_IMPORTED_MODULE_2__["default"](null, error);
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
                response = await __classPrivateFieldGet(this, _HTTP_fetch, "f").call(this, request);
                await chain.applyPostResponse(response, settings);
            }
            catch (error) {
                response = await chain.applyPostError(error, request, this);
                if (!(0,_like_response__WEBPACK_IMPORTED_MODULE_3__.likeResponse)(response)) {
                    response = (0,_like_response__WEBPACK_IMPORTED_MODULE_3__.likeResponse)(error) ?
                        error :
                        new _response_error__WEBPACK_IMPORTED_MODULE_2__["default"](null, error);
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        init !== null && init !== void 0 ? init : (init = {});
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
        const chain = isHTTPExecutionChain(http) ?
            http :
            new HTTPExecutionChain(http), interceptors = __classPrivateFieldGet(this, _HTTP_interceptors, "f"), length = interceptors === null || interceptors === void 0 ? void 0 : interceptors.length;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9odHRwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUVILE9BQU8sRUFBa0IsV0FBVyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXpELE9BQU8sYUFBYSxNQUFNLGtCQUFrQixDQUFDO0FBQzdDLE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUMvQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFtQy9DOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7Ozs7Ozs7Ozs7R0FjRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7Ozs7Ozs7OztHQWFHO0FBRUg7Ozs7OztHQU1HO0FBRUg7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVILE1BQU0sQ0FBQyxNQUNILEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDM0IsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBRTVCLFFBQVEsR0FBYTtJQUNqQixLQUFLLEVBQUUsU0FBUztJQUNoQixXQUFXLEVBQUUsYUFBYTtJQUMxQixNQUFNLEVBQUUsS0FBSztJQUNiLElBQUksRUFBRSxNQUFNO0lBQ1osUUFBUSxFQUFFLFFBQVE7Q0FDckIsRUFFRCxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXVCLEVBQzdDLFNBQVMsR0FBRyxFQUFFLENBQUUsT0FBTyxDQUFtQyxDQUFDO0FBRS9EOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxrQ0FBa0MsR0FBRyxJQUFJLENBQUUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLENBQTBELENBQUM7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

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__2__;

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResponseError": () => (/* binding */ ResponseError),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _response_statuses__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _like_response__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ResponseError_originalError, _ResponseError_response;




const { defineProperty } = Reflect, isError = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(Error);
class ResponseError extends _blue_core__WEBPACK_IMPORTED_MODULE_0__.FrameworkError {
    constructor(response = null, messageOrError = 'Invalid response') {
        super(isError(messageOrError) ? messageOrError.message : messageOrError);
        _ResponseError_originalError.set(this, void 0);
        _ResponseError_response.set(this, void 0);
        this.stack = isError(messageOrError) ? messageOrError.stack : '';
        this.name = 'ResponseError';
        __classPrivateFieldSet(this, _ResponseError_originalError, isError(messageOrError) ? messageOrError : null, "f");
        if (!(0,_like_response__WEBPACK_IMPORTED_MODULE_2__.likeResponse)(response)) {
            response = _response_statuses__WEBPACK_IMPORTED_MODULE_3__.IM_A_TEAPOT.createResponse(null);
        }
        __classPrivateFieldSet(this, _ResponseError_response, response, "f");
        defineProperty(this, 'body', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").body,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'bodyUsed', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").bodyUsed,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'headers', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").headers,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'ok', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").ok,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'redirected', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").redirected,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'status', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").status,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'statusText', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").statusText,
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'type', {
            get: () => 'error',
            configurable: true,
            enumerable: true
        });
        defineProperty(this, 'url', {
            get: () => __classPrivateFieldGet(this, _ResponseError_response, "f").url,
            configurable: true,
            enumerable: true
        });
    }
    get [(_ResponseError_originalError = new WeakMap(), _ResponseError_response = new WeakMap(), Symbol.toStringTag)]() {
        return 'ResponseError';
    }
    clone() {
        const error = isError(__classPrivateFieldGet(this, _ResponseError_originalError, "f")) ? __classPrivateFieldGet(this, _ResponseError_originalError, "f") : new Error(this.message), response = __classPrivateFieldGet(this, _ResponseError_response, "f").clone();
        error.stack = this.stack;
        error.name = this.name;
        return new ResponseError(response, error);
    }
    arrayBuffer() {
        return __classPrivateFieldGet(this, _ResponseError_response, "f").arrayBuffer();
    }
    blob() {
        return __classPrivateFieldGet(this, _ResponseError_response, "f").blob();
    }
    formData() {
        return __classPrivateFieldGet(this, _ResponseError_response, "f").formData();
    }
    json() {
        return __classPrivateFieldGet(this, _ResponseError_response, "f").json();
    }
    text() {
        return __classPrivateFieldGet(this, _ResponseError_response, "f").text();
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ResponseError);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzcG9uc2UtZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7O0FBRUgsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM1QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNoQyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsTUFDSSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDNUIsT0FBTyxHQUFHLEVBQUUsQ0FBRSxLQUFLLENBQWlDLENBQUM7QUFFekQsTUFBTSxPQUFPLGFBQWMsU0FBUSxjQUFjO0lBdUI3QyxZQUFhLFdBQXFCLElBQUksRUFBRSxpQkFBaUMsa0JBQWtCO1FBQ3ZGLEtBQUssQ0FBRSxPQUFPLENBQUUsY0FBYyxDQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBRSxDQUFDO1FBdkJqRiwrQ0FBc0I7UUFDdEIsMENBQW9CO1FBdUJoQixJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBRSxjQUFjLENBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQ25FLElBQUksQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDO1FBRTVCLHVCQUFBLElBQUksZ0NBQWtCLE9BQU8sQ0FBRSxjQUFjLENBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQUEsQ0FBQztRQUV4RSxJQUFJLENBQUMsWUFBWSxDQUFFLFFBQVEsQ0FBRSxFQUFFO1lBQzNCLFFBQVEsR0FBRyxXQUFXLENBQUMsY0FBYyxDQUFFLElBQUksQ0FB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

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "likeResponse": () => (/* binding */ likeResponse)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

const isResponse = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Response);
const likeResponse = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.anyPass)([
    isResponse,
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({
        body: ReadableStream,
        bodyUsed: Boolean,
        headers: Headers,
        ok: Boolean,
        redirected: Boolean,
        status: Number,
        statusText: String,
        //trailer: Promise,
        type: String,
        url: String,
        clone: Function,
        arrayBuffer: Function,
        blob: Function,
        formData: Function,
        json: Function,
        text: Function
    })
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saWtlLXJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUvQyxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUUsUUFBUSxDQUFvQyxDQUFDO0FBRXBFLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUU7SUFDakMsVUFBVTtJQUNWLElBQUksQ0FBRTtRQUNGLElBQUksRUFBRSxjQUFjO1FBQ3BCLFFBQVEsRUFBRSxPQUFPO1FBQ2pCLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLEVBQUUsRUFBRSxPQUFPO1FBQ1gsVUFBVSxFQUFFLE9BQU87UUFDbkIsTUFBTSxFQUFFLE1BQU07UUFDZCxVQUFVLEVBQUUsTUFBTTtRQUNsQixtQkFBbUI7UUFDbkIsSUFBSSxFQUFFLE1BQU07UUFDWixHQUFHLEVBQUUsTUFBTTtRQUNYLEtBQUssRUFBRSxRQUFRO1FBQ2YsV0FBVyxFQUFFLFFBQVE7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxRQUFRLEVBQUUsUUFBUTtRQUNsQixJQUFJLEVBQUUsUUFBUTtRQUNkLElBQUksRUFBRSxRQUFRO0tBQ2pCLENBQUU7Q0FDTixDQUFvQyxDQUFDIn0=

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ACCEPTED": () => (/* binding */ ACCEPTED),
/* harmony export */   "ALREADY_REPORTED": () => (/* binding */ ALREADY_REPORTED),
/* harmony export */   "BAD_GATEWAY": () => (/* binding */ BAD_GATEWAY),
/* harmony export */   "BAD_REQUEST": () => (/* binding */ BAD_REQUEST),
/* harmony export */   "CONFLICT": () => (/* binding */ CONFLICT),
/* harmony export */   "CONTINUE": () => (/* binding */ CONTINUE),
/* harmony export */   "CREATED": () => (/* binding */ CREATED),
/* harmony export */   "EARLY_HINTS": () => (/* binding */ EARLY_HINTS),
/* harmony export */   "EXPECTATION_FAILED": () => (/* binding */ EXPECTATION_FAILED),
/* harmony export */   "FAILED_DEPENDENCY": () => (/* binding */ FAILED_DEPENDENCY),
/* harmony export */   "FORBIDDEN": () => (/* binding */ FORBIDDEN),
/* harmony export */   "FOUND": () => (/* binding */ FOUND),
/* harmony export */   "GATEWAY_TIMEOUT": () => (/* binding */ GATEWAY_TIMEOUT),
/* harmony export */   "GONE": () => (/* binding */ GONE),
/* harmony export */   "HTTP_VERSION_NOT_SUPPORTED": () => (/* binding */ HTTP_VERSION_NOT_SUPPORTED),
/* harmony export */   "IM_A_TEAPOT": () => (/* binding */ IM_A_TEAPOT),
/* harmony export */   "IM_USED": () => (/* binding */ IM_USED),
/* harmony export */   "INSUFFICIENT_STORAGE": () => (/* binding */ INSUFFICIENT_STORAGE),
/* harmony export */   "INTERNAL_SERVER_ERROR": () => (/* binding */ INTERNAL_SERVER_ERROR),
/* harmony export */   "LENGTH_REQUIRED": () => (/* binding */ LENGTH_REQUIRED),
/* harmony export */   "LOCKED": () => (/* binding */ LOCKED),
/* harmony export */   "LOOP_DETECTED": () => (/* binding */ LOOP_DETECTED),
/* harmony export */   "METHOD_NOT_ALLOWED": () => (/* binding */ METHOD_NOT_ALLOWED),
/* harmony export */   "MISDIRECTED": () => (/* binding */ MISDIRECTED),
/* harmony export */   "MOVED_PERMANENTLY": () => (/* binding */ MOVED_PERMANENTLY),
/* harmony export */   "MULTIPLE_CHOICE": () => (/* binding */ MULTIPLE_CHOICE),
/* harmony export */   "MULTI_STATUS": () => (/* binding */ MULTI_STATUS),
/* harmony export */   "NETWORK_AUTHENTICATION_REQUIRED": () => (/* binding */ NETWORK_AUTHENTICATION_REQUIRED),
/* harmony export */   "NON_AUTHORITATIVE_INFORMATION": () => (/* binding */ NON_AUTHORITATIVE_INFORMATION),
/* harmony export */   "NOT_ACCEPTABLE": () => (/* binding */ NOT_ACCEPTABLE),
/* harmony export */   "NOT_EXTENDED": () => (/* binding */ NOT_EXTENDED),
/* harmony export */   "NOT_FOUND": () => (/* binding */ NOT_FOUND),
/* harmony export */   "NOT_IMPLEMENTED": () => (/* binding */ NOT_IMPLEMENTED),
/* harmony export */   "NOT_MODIFIED": () => (/* binding */ NOT_MODIFIED),
/* harmony export */   "NO_CONTENT": () => (/* binding */ NO_CONTENT),
/* harmony export */   "OK": () => (/* binding */ OK),
/* harmony export */   "PARTIAL_CONTENT": () => (/* binding */ PARTIAL_CONTENT),
/* harmony export */   "PAYLOAD_TOO_LARGE": () => (/* binding */ PAYLOAD_TOO_LARGE),
/* harmony export */   "PAYMENT_REQUIRED": () => (/* binding */ PAYMENT_REQUIRED),
/* harmony export */   "PERMANENT_REDIRECT": () => (/* binding */ PERMANENT_REDIRECT),
/* harmony export */   "PRECONDITION_FAILED": () => (/* binding */ PRECONDITION_FAILED),
/* harmony export */   "PRECONDITION_REQUIRED": () => (/* binding */ PRECONDITION_REQUIRED),
/* harmony export */   "PROCESSING": () => (/* binding */ PROCESSING),
/* harmony export */   "PROXY_AUTHENTICATION_REQUIRED": () => (/* binding */ PROXY_AUTHENTICATION_REQUIRED),
/* harmony export */   "RANGE_NOT_SATISFIED": () => (/* binding */ RANGE_NOT_SATISFIED),
/* harmony export */   "REQUEST_HEADER_FIELDS_TOO_LARGE": () => (/* binding */ REQUEST_HEADER_FIELDS_TOO_LARGE),
/* harmony export */   "REQUEST_TIMEOUT": () => (/* binding */ REQUEST_TIMEOUT),
/* harmony export */   "RESET_CONTENT": () => (/* binding */ RESET_CONTENT),
/* harmony export */   "SEE_OTHER": () => (/* binding */ SEE_OTHER),
/* harmony export */   "SERVICE_UNAVAILABLE": () => (/* binding */ SERVICE_UNAVAILABLE),
/* harmony export */   "SWITCHING_PROTOCOL": () => (/* binding */ SWITCHING_PROTOCOL),
/* harmony export */   "SWITCH_PROXY": () => (/* binding */ SWITCH_PROXY),
/* harmony export */   "TEMPORARY_REDIRECT": () => (/* binding */ TEMPORARY_REDIRECT),
/* harmony export */   "TOO_EARLY": () => (/* binding */ TOO_EARLY),
/* harmony export */   "TOO_MANY_REQUESTS": () => (/* binding */ TOO_MANY_REQUESTS),
/* harmony export */   "UNAUTHORIZED": () => (/* binding */ UNAUTHORIZED),
/* harmony export */   "UNAVAILABLE_FOR_LEGAL_REASONS": () => (/* binding */ UNAVAILABLE_FOR_LEGAL_REASONS),
/* harmony export */   "UNPROCESSABLE_ENTITY": () => (/* binding */ UNPROCESSABLE_ENTITY),
/* harmony export */   "UNSUPPORTED_MEDIA_TYPE": () => (/* binding */ UNSUPPORTED_MEDIA_TYPE),
/* harmony export */   "UPGRADE_REQUIRED": () => (/* binding */ UPGRADE_REQUIRED),
/* harmony export */   "URI_TOO_LONG": () => (/* binding */ URI_TOO_LONG),
/* harmony export */   "USE_PROXY": () => (/* binding */ USE_PROXY),
/* harmony export */   "VARIANT_ALSO_NEGOTIATES": () => (/* binding */ VARIANT_ALSO_NEGOTIATES)
/* harmony export */ });
/* harmony import */ var _response_status__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7);
/**
 * @author Jeff Rose
 */

/**
 * @namespace module:http.ResponseStatuses
 */
/**
 * Information Response
 */
/**
 * This interim response indicates that everything so far is OK and that the client should continue the request, or ignore the response if the request is already finished.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.CONTINUE
 */
const CONTINUE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](100, 'Continue');
/**
 * This code is sent in response to an `Upgrade` request header from the client, and indicates the protocol the server is switching to.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SWITCHING_PROTOCOL
 */
const SWITCHING_PROTOCOL = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](101, 'Switching Protocol');
/**
 * This code indicates that the server has received and is processing the request, but no response is available yet.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PROCESSING
 */
const PROCESSING = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](102, 'Processing');
/**
 * This status code is primarily intended to be used with the `Link` header, letting the user agent start preloading resources while the server prepares a response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.EARLY_HINTS
 */
const EARLY_HINTS = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](103, 'Early Hints');
/**
 * Successful Responses
 */
/**
 * The request has succeeded. The meaning of the success depends on the HTTP method:
 * * `GET`: The resource has been fetched and is transmitted in the message body.
 * * `HEAD`: The entity headers are in the message body.
 * * `PUT` or `POST`: The resource describing the result of the action is transmitted in the message body.
 * * `TRACE`: The message body contains the request message as received by the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.OK
 */
const OK = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](200, 'OK');
/**
 * The request has succeeded and a new resource has been created as a result. This is typically the response sent after `POST` requests, or some `PUT` requests.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.CREATED
 */
const CREATED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](201, 'Created');
/**
 * The request has been received but not yet acted upon. It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request. It is intended for cases where another process or server handles the request, or for batch processing.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.ACCEPTED
 */
const ACCEPTED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](202, 'Accepted');
/**
 * This response code means the returned meta-information is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy. This is mostly used for mirrors or backups of another resource. Except for that specific case, the "200 OK" response is preferred to this status.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NON_AUTHORITATIVE_INFORMATION
 */
const NON_AUTHORITATIVE_INFORMATION = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](203, 'Non-Authoritative Information');
/**
 * There is no content to send for this request, but the headers may be useful. The user-agent may update its cached headers for this resource with the new ones.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NO_CONTENT
 */
const NO_CONTENT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](204, 'No Content');
/**
 * Tells the user-agent to reset the document which sent this request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.RESET_CONTENT
 */
const RESET_CONTENT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](205, 'Reset Content');
/**
 * This response code is used when the `Range` header is sent from the client to request only part of a resource.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PARTIAL_CONTENT
 */
const PARTIAL_CONTENT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](206, 'Partial Content');
/**
 * Conveys information about multiple resources, for situations where multiple status codes might be appropriate..
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MULTI_STATUS
 */
const MULTI_STATUS = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](207, 'Multi-Status');
/**
 * Used inside a `<dav:propstat>` response element to avoid repeatedly enumerating the internal members of multiple bindings to the same collection.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.ALREADY_REPORTED
 */
const ALREADY_REPORTED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](208, 'Already Reported');
/**
 * The server has fulfilled a `GET` request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.IM_USED
 */
const IM_USED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](226, 'IM Used');
/**
 * Redirection Responses
 */
/**
 * The request has more than one possible response. The user-agent or user should choose one of them. (There is no standardized way of choosing one of the responses, but HTML links to the possibilities are recommended so the user can pick.)
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MULTIPLE_CHOICE
 */
const MULTIPLE_CHOICE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](300, 'Multiple Choice');
/**
 * The URL of the requested resource has been changed permanently. The new URL is given in the response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MOVED_PERMANENTLY
 */
const MOVED_PERMANENTLY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](301, 'Moved Permanently');
/**
 * This response code means that the URI of requested resource has been changed _temporarily_. Further changes in the URI might be made in the future. Therefore, this same URI should be used by the client in future requests.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.FOUND
 */
const FOUND = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](302, 'Found');
/**
 * The server sent this response to direct the client to get the requested resource at another URI with a `GET` request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SEE_OTHER
 */
const SEE_OTHER = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](303, 'See Other');
/**
 * This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_MODIFIED
 */
const NOT_MODIFIED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](304, 'Not Modified');
/**
 * Defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.USE_PROXY
 */
const USE_PROXY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](305, 'Use Proxy');
/**
 * This response code is no longer used; it is just reserved. It was used in a previous version of the HTTP/1.1 specification. Originally meant "Subsequent requests should use the specified proxy."
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SWITCH_PROXY
 */
const SWITCH_PROXY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](306, 'Switch Proxy');
/**
 * The server sends this response to direct the client to get the requested resource at another URI with same method that was used in the prior request. This has the same semantics as the `302 Found` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.TEMPORARY_REDIRECT
 */
const TEMPORARY_REDIRECT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](307, 'Temporary Redirect');
/**
 * This means that the resource is now permanently located at another URI, specified by the `Location:` HTTP Response header. This has the same semantics as the `301 Moved Permanently` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PERMANENT_REDIRECT
 */
const PERMANENT_REDIRECT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](308, 'Permanent Redirect');
/**
 * Client Error Responses
 */
/**
 * The server could not understand the request due to invalid syntax.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.BAD_REQUEST
 */
const BAD_REQUEST = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](400, 'Bad Request');
/**
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNAUTHORIZED
 */
const UNAUTHORIZED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](401, 'Unauthorized');
/**
 * This response code is reserved for future use. The initial aim for creating this code was using it for digital payment systems, however this status code is used very rarely and no standard convention exists.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PAYMENT_REQUIRED
 */
const PAYMENT_REQUIRED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](402, 'Payment Required');
/**
 * The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401, the client's identity is known to the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.FORBIDDEN
 */
const FORBIDDEN = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](403, 'Forbidden');
/**
 * The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurrence on the web.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_FOUND
 */
const NOT_FOUND = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](404, 'Not Found');
/**
 * The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid `DELETE`-ing a resource. The two mandatory methods, `GET` and `HEAD`, must never be disabled and should not return this error code.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.METHOD_NOT_ALLOWED
 */
const METHOD_NOT_ALLOWED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](405, 'Method Not Allowed');
/**
 * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content that conforms to the criteria given by the user agent.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_ACCEPTABLE
 */
const NOT_ACCEPTABLE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](406, 'Not Acceptable');
/**
 * This is similar to 401 but authentication is needed to be done by a proxy.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PROXY_AUTHENTICATION_REQUIRED
 */
const PROXY_AUTHENTICATION_REQUIRED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](407, 'Proxy Authentication Required');
/**
 * This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers, like Chrome, Firefox 27+, or IE9, use HTTP pre-connection mechanisms to speed up surfing. Also note that some servers merely shut down the connection without sending this message.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.REQUEST_TIMEOUT
 */
const REQUEST_TIMEOUT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](408, 'Request Timeout');
/**
 * This response is sent when a request conflicts with the current state of the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.CONFLICT
 */
const CONFLICT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](409, 'Conflict');
/**
 * This response is sent when the requested content has been permanently deleted from server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for "limited-time, promotional services". APIs should not feel compelled to indicate resources that have been deleted with this status code.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.GONE
 */
const GONE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](410, 'Gone');
/**
 * Server rejected the request because the `Content-Length` header field is not defined and the server requires it.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.LENGTH_REQUIRED
 */
const LENGTH_REQUIRED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](411, 'Length Required');
/**
 * The client has indicated preconditions in its headers which the server does not meet.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PRECONDITION_FAILED
 */
const PRECONDITION_FAILED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](412, 'Precondition Failed');
/**
 * Request entity is larger than limits defined by server; the server might close the connection or return an `Retry-After` header field.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PAYLOAD_TOO_LARGE
 */
const PAYLOAD_TOO_LARGE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](413, 'Payload Too Large');
/**
 * The URI requested by the client is longer than the server is willing to interpret.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.URI_TOO_LONG
 */
const URI_TOO_LONG = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](414, 'URI Too Long');
/**
 * The media format of the requested data is not supported by the server, so the server is rejecting the request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNSUPPORTED_MEDIA_TYPE
 */
const UNSUPPORTED_MEDIA_TYPE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](415, 'Unsupported Media Type');
/**
 * The range specified by the Range header field in the request can't be fulfilled; it's possible that the range is outside the size of the target URI's data.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.RANGE_NOT_SATISFIED
 */
const RANGE_NOT_SATISFIED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](416, 'Range Not Satisfiable');
/**
 * This response code means the expectation indicated by the Expect request header field can't be met by the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.EXPECTATION_FAILED
 */
const EXPECTATION_FAILED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](417, 'Expectation Failed');
/**
 * The server refuses the attempt to brew coffee with a teapot.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.IM_A_TEAPOT
 */
const IM_A_TEAPOT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](418, 'I\'m a teapot');
/**
 * The request was directed at a server that is not able to produce a response. This can be sent by a server that is not configured to produce responses for the combination of scheme and authority that are included in the request URI.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MISDIRECTED
 */
const MISDIRECTED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](421, 'Misdirected Request');
/**
 * The request was well-formed but was unable to be followed due to semantic errors.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNPROCESSABLE_ENTITY
 */
const UNPROCESSABLE_ENTITY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](422, 'Unprocessable Entity');
/**
 * The resource that is being accessed is locked.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.LOCKED
 */
const LOCKED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](423, 'Locked');
/**
 * The request failed due to failure of a previous request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.FAILED_DEPENDENCY
 */
const FAILED_DEPENDENCY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](424, 'Failed Dependency');
/**
 * Indicates that the server is unwilling to risk processing a request that might be replayed.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.TOO_EARLY
 */
const TOO_EARLY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](425, 'Too Early');
/**
 * The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an `Upgrade` header in a 426 response to indicate the required protocol(s).
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UPGRADE_REQUIRED
 */
const UPGRADE_REQUIRED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](426, 'Upgrade Required');
/**
 * The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client `GET`s a resource's state, modifies it, and `PUT`s it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PRECONDITION_REQUIRED
 */
const PRECONDITION_REQUIRED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](428, 'Precondition Required');
/**
 * The user has sent too many requests in a given amount of time ("rate limiting").
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.TOO_MANY_REQUESTS
 */
const TOO_MANY_REQUESTS = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](429, 'Too Many Requests');
/**
 * The server is unwilling to process the request because its header fields are too large. The request may be resubmitted after reducing the size of the request header fields.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.REQUEST_HEADER_FIELDS_TOO_LARGE
 */
const REQUEST_HEADER_FIELDS_TOO_LARGE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](431, 'Request Header Fields Too Large');
/**
 * The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNAVAILABLE_FOR_LEGAL_REASONS
 */
const UNAVAILABLE_FOR_LEGAL_REASONS = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](451, 'Unavailable For Legal Reasons');
/**
 * Server Error Responses
 */
/**
 * The server has encountered a situation it doesn't know how to handle.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.INTERNAL_SERVER_ERROR
 */
const INTERNAL_SERVER_ERROR = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](500, 'Internal Server Error');
/**
 * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are `GET` and `HEAD`.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_IMPLEMENTED
 */
const NOT_IMPLEMENTED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](501, 'Not Implemented');
/**
 * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.BAD_GATEWAY
 */
const BAD_GATEWAY = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](502, 'Bad Gateway');
/**
 * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This responses should be used for temporary conditions and the `Retry-After:` HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SERVICE_UNAVAILABLE
 */
const SERVICE_UNAVAILABLE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](503, 'Service Unavailable');
/**
 * This error response is given when the server is acting as a gateway and cannot get a response in time.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.GATEWAY_TIMEOUT
 */
const GATEWAY_TIMEOUT = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](504, 'Gateway Timeout');
/**
 * The HTTP version used in the request is not supported by the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.HTTP_VERSION_NOT_SUPPORTED
 */
const HTTP_VERSION_NOT_SUPPORTED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](505, 'HTTP Version Not Supported');
/**
 * The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.VARIANT_ALSO_NEGOTIATES
 */
const VARIANT_ALSO_NEGOTIATES = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](506, 'Variant Also Negotiates');
/**
 * The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.INSUFFICIENT_STORAGE
 */
const INSUFFICIENT_STORAGE = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](507, 'Insufficient Storage');
/**
 * The server detected an infinite loop while processing the request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.LOOP_DETECTED
 */
const LOOP_DETECTED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](508, 'Loop Detected');
/**
 * Further extensions to the request are required for the server to fulfil it.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_EXTENDED
 */
const NOT_EXTENDED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](510, 'Not Extended');
/**
 * The 511 status code indicates that the client needs to authenticate to gain network access.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NETWORK_AUTHENTICATION_REQUIRED
 */
const NETWORK_AUTHENTICATION_REQUIRED = _response_status__WEBPACK_IMPORTED_MODULE_0__["default"]["for"](511, 'Network Authentication Required');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2Utc3RhdHVzZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVzcG9uc2Utc3RhdHVzZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUM7QUFFL0M7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxVQUFVLENBQUUsQ0FBQztBQUU5RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxvQkFBb0IsQ0FBRSxDQUFDO0FBRWxGOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxZQUFZLENBQUUsQ0FBQztBQUVsRTs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBRSxHQUFHLEVBQUUsYUFBYSxDQUFFLENBQUM7QUFFcEU7O0dBRUc7QUFFSDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUUsR0FBRyxFQUFFLElBQUksQ0FBRSxDQUFDO0FBRWxEOzs7R0FHRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFFLEdBQUcsRUFBRSxTQUFTLENBQUUsQ0FBQztBQUU1RDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBRSxHQUFHLEVBQUUsVUFBVSxDQUFFLENBQUM7QUFFOUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQUcsY0FBYyxDQUFDLEdBQUcsQ0FBRSxHQUFHLEVBQUUs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

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ResponseStatus)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _like_response__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
/**
 * @author Jeff Rose
 */


const { assign } = Object, { defineProperty } = Reflect, statuses = new Map();
/**
 * @class module:http.ResponseStatus
 * @implements module:core.Comparable
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 * @param {external:number} code
 * @param {external:string} text
 * @see {@link https://tools.ietf.org/html/rfc2616#section-10}
 */
class ResponseStatus {
    constructor(code, text) {
        /**
         * @member {external:number} code
         */
        defineProperty(this, 'code', {
            value: code,
            configurable: true,
            enumerable: true,
            writable: false
        });
        /**
         * @member {external:string} text
         */
        defineProperty(this, 'text', {
            value: text,
            configurable: true,
            enumerable: true,
            writable: false
        });
    }
    static for(codeOrResponse, text) {
        let code;
        if ((0,_like_response__WEBPACK_IMPORTED_MODULE_1__.likeResponse)(codeOrResponse)) {
            code = codeOrResponse.status;
            text = codeOrResponse.statusText;
        }
        else {
            code = codeOrResponse;
        }
        if (statuses.has(code)) {
            return statuses.get(code);
        }
        else if (text === null || text === void 0 ? void 0 : text.length) {
            const status = new ResponseStatus(code, text);
            statuses.set(code, status);
            return status;
        }
        return null;
    }
    get [Symbol.toStringTag]() {
        return `ResponseStatus:${this.code}`;
    }
    /**
     * Whether or not the response status code is between 100 and 199.
     * @member {external:boolean} module:http.ResponseStatus#isInformationClass
     */
    get isInformationClass() {
        return 100 <= this.code && this.code <= 199;
    }
    /**
     * Whether or not the response status code is between 200 and 299.
     * @member {external:boolean} module:http.ResponseStatus#isSuccessClass
     */
    get isSuccessClass() {
        return 200 <= this.code && this.code <= 299;
    }
    /**
     * Whether or not the response status code is between 300 and 399.
     * @member {external:boolean} module:http.ResponseStatus#isRedirectClass
     */
    get isRedirectClass() {
        return 300 <= this.code && this.code <= 399;
    }
    /**
     * Whether or not the response status code is between 400 and 499.
     * @member {external:boolean} module:http.ResponseStatus#isClientErrorClass
     */
    get isClientErrorClass() {
        return 400 <= this.code && this.code <= 499;
    }
    /**
     * Whether or not the response status code is between 500 and 599.
     * @member {external:boolean} module:http.ResponseStatus#isServerErrorClass
     */
    get isServerErrorClass() {
        return 500 <= this.code && this.code <= 599;
    }
    /**
     * @function module:http.ResponseStatus#compareTo
     * @param {module:http.ResponseStatus} value
     * @returns {external:number}
     */
    compareTo(value) {
        let comparison;
        // Compare code
        comparison = _blue_core__WEBPACK_IMPORTED_MODULE_0__.numberComparator.compare(this.code, value.code);
        if (comparison !== 0) {
            return comparison;
        }
        // Compare text
        comparison = _blue_core__WEBPACK_IMPORTED_MODULE_0__.stringComparator.compare(this.text, value.text);
        if (comparison !== 0) {
            return comparison;
        }
        return 0;
    }
    /**
     * @function module:http.ResponseStatus#equals
     * @param {module:http.ResponseStatus} value
     * @returns {external:boolean}
     */
    equals(value) {
        return this.compareTo(value) === 0;
    }
    /**
     * @function module:http.ResponseStatus#createResponse
     * @param {external:BodyInit} body
     * @param {external:HeadersInit} [headers={}]
     * @returns {external:Response}
     */
    createResponse(body, headers = {}) {
        return new Response(body, assign(this.toResponseInit(), { headers }));
    }
    /**
     * @function module:http.ResponseStatus#toJSON
     * @returns {module:core.JSONObject}
     */
    toJSON() {
        const json = (0,_blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)();
        json.code = this.code;
        json.text = this.text;
        return json;
    }
    /**
     * @function module:http.ResponseStatus#toResponseInit
     * @returns {external:ResponseInit}
     */
    toResponseInit() {
        const init = (0,_blue_core__WEBPACK_IMPORTED_MODULE_0__.createNull)();
        init.status = this.code;
        init.statusText = this.text;
        return init;
    }
    /**
     * @function module:http.ResponseStatus#toString
     * @returns {external:string}
     */
    toString() {
        return `${this.code} ${this.text}`;
    }
}
/**
 * Retrieves a matching instance of `ResponseStatus`, or creates it if it does not exist and `text` is provided. Standard HTTP response statuses have already been created.
 * @function module:http.ResponseStatus.for
 * @param {external:number} code
 * @param {external:string} [text]
 * @returns {module:http.ResponseStatus}
 * @example
 * const okStatus = ResponseStatus.for( 200 ); // 200 OK
 * const coffeePotStatus = ResponseStatus.for( 419, 'I\'m a coffee pot' ); // 419 I'm a coffee pot
 * const invalidStatus = ResponseStatus.for( 999 ); // null
 */
/**
 * Retrieves a matching instance of `ResponseStatus`, or creates it if it does not exist. Standard HTTP response statuses have already been created.
 * @function module:http.ResponseStatus.for
 * @param {external:Response} response
 * @returns {module:http.ResponseStatus}
 * @example
 * const response = new Response( null, { status: 200, statusText: "OK" } );
 * const okStatus = ResponseStatus.for( response ); // 200 OK
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2Utc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc3BvbnNlLXN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQWMsVUFBVSxFQUF5QixnQkFBZ0IsRUFBZ0IsZ0JBQWdCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDN0gsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRS9DLE1BQ0ksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQ25CLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQTBCLENBQUM7QUFFakQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLGNBQWM7SUF1RS9CLFlBQWEsSUFBWSxFQUFFLElBQVk7UUFDbkM7O1dBRUc7UUFDSCxjQUFjLENBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUMxQixLQUFLLEVBQUUsSUFBSTtZQUNYLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztRQUNKOztXQUVHO1FBQ0gsY0FBYyxDQUFFLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDMUIsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7SUFDUixDQUFDO0lBcEZELE1BQU0sQ0FBQyxHQUFHLENBQUUsY0FBaUMsRUFBRSxJQUFhO1FBQ3hELElBQUksSUFBWSxDQUFDO1FBRWpCLElBQUksWUFBWSxDQUFFLGNBQWMsQ0FBRSxFQUFFO1lBQ2hDLElBQUksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO1NBQ3BDO2FB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

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "HTTPHeader": () => (/* binding */ HTTPHeader)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */


const { defineProperty, deleteProperty, get, set } = Reflect, alwaysNull = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.always)(null), noop = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.always)(void 0), isHeaders = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(Headers), isRecord = _blue_core__WEBPACK_IMPORTED_MODULE_0__.isJSONObject;
function deletePair(entries, name) {
    const length = entries.length;
    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                deleteProperty(entries, index);
                break;
            }
        }
    }
}
function getPair(entries, name) {
    const length = entries.length;
    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                return entries[index][1];
            }
        }
    }
    return null;
}
function setPair(entries, name, value) {
    const length = entries.length;
    let found = false;
    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                // @ts-ignore: ¯\_(ツ)_/¯
                entries[index][1] = value;
                found = true;
                break;
            }
        }
    }
    if (!found) {
        entries.push([name, value]);
    }
}
function deleteHeader(headers, name) {
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.cond)([
        [isHeaders, (h) => h.delete(name)],
        [_blue_core__WEBPACK_IMPORTED_MODULE_0__.isEntries, (h) => deletePair(h, name)],
        [isRecord, (h) => deleteProperty(h, name)],
        [_blue_util__WEBPACK_IMPORTED_MODULE_1__.T, noop]
    ])(headers);
}
function getHeader(headers, name) {
    return (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.cond)([
        [isHeaders, (h) => h.get(name)],
        [_blue_core__WEBPACK_IMPORTED_MODULE_0__.isEntries, (h) => getPair(h, name)],
        [isRecord, (h) => get(h, name)],
        [_blue_util__WEBPACK_IMPORTED_MODULE_1__.T, alwaysNull]
    ])(headers);
}
function hasHeader(headers, name) {
    return (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.isString)(getHeader(headers, name));
}
function setHeader(headers, name, value) {
    const stringValue = String(value);
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.cond)([
        [isHeaders, (h) => h.set(name, stringValue)],
        [_blue_core__WEBPACK_IMPORTED_MODULE_0__.isEntries, (h) => setPair(h, name, stringValue)],
        [isRecord, (h) => set(h, name, stringValue)],
        [_blue_util__WEBPACK_IMPORTED_MODULE_1__.T, noop]
    ])(headers);
}
/**
 * @class module:http.HTTPHeader
 * @implements module:core.Serializable
 */
class HTTPHeader {
    constructor(name) {
        /**
         * @readonly
         * @member {external:string} module:http.HTTPHeader#name
         */
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: true,
            writable: false
        });
    }
    get [Symbol.toStringTag]() {
        return `HTTPHeader:${this.name}`;
    }
    delete(headers) {
        headers && deleteHeader(headers, this.name);
    }
    get(headers) {
        return headers ? getHeader(headers, this.name) : null;
    }
    has(headers) {
        return headers ? hasHeader(headers, this.name) : false;
    }
    set(headers, value) {
        if (!headers) {
            throw new TypeError('headers is undefined');
        }
        setHeader(headers, this.name, value);
    }
    /**
     * @function module:http.HTTPHeader#toJSON
     * @returns {module:core.JSONObject} A JSON representation of the HTTP header
     */
    toJSON() {
        return this.name;
    }
    /**
     * @function module:http.HTTPHeader#toString
     * @returns {external:string} A string representation of the HTTP header
     */
    toString() {
        return this.name;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1oZWFkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaHR0cC1oZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQTJCLE1BQU0sWUFBWSxDQUFDO0FBQzlFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTNELE1BQ0ksRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxPQUFPLEVBQ3RELFVBQVUsR0FBRyxNQUFNLENBQUUsSUFBSSxDQUFFLEVBQzNCLElBQUksR0FBRyxNQUFNLENBQUUsS0FBSyxDQUFDLENBQUUsRUFDdkIsU0FBUyxHQUFHLEVBQUUsQ0FBRSxPQUFPLENBQW1DLEVBQzFELFFBQVEsR0FBRyxZQUE0RCxDQUFDO0FBRTVFLFNBQVMsVUFBVSxDQUFFLE9BQU8sRUFBRSxJQUFZO0lBQ3RDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFFOUIsSUFBSSxNQUFNLEVBQUU7UUFDUixLQUFLLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ3pDLElBQUksT0FBTyxDQUFFLEtBQUssQ0FBRSxDQUFFLENBQUMsQ0FBRSxLQUFLLElBQUksRUFBRTtnQkFDaEMsY0FBYyxDQUFFLE9BQU8sRUFBRSxLQUFLLENBQUUsQ0FBQztnQkFDakMsTUFBTTthQUNUO1NBQ0o7S0FDSjtBQUNMLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBRSxPQUFPLEVBQUUsSUFBWTtJQUNuQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBRTlCLElBQUksTUFBTSxFQUFFO1FBQ1IsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVB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

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ContentTypeInterceptor": () => (/* reexport safe */ _interceptors_content_type_interceptor__WEBPACK_IMPORTED_MODULE_2__.ContentTypeInterceptor),
/* harmony export */   "DataParameterInterceptor": () => (/* reexport safe */ _interceptors_data_parameter_interceptor__WEBPACK_IMPORTED_MODULE_3__.DataParameterInterceptor),
/* harmony export */   "IfModifiedInterceptor": () => (/* reexport safe */ _interceptors_if_modified_interceptor__WEBPACK_IMPORTED_MODULE_5__.IfModifiedInterceptor),
/* harmony export */   "MappedResponseClassHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__.MappedResponseClassHTTPInterceptor),
/* harmony export */   "MappedResponseCodeHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_code_interceptor__WEBPACK_IMPORTED_MODULE_1__.MappedResponseCodeHTTPInterceptor),
/* harmony export */   "NotOKInterceptor": () => (/* reexport safe */ _interceptors_not_ok_interceptor__WEBPACK_IMPORTED_MODULE_6__.NotOKInterceptor),
/* harmony export */   "ResponseTypeInterceptor": () => (/* reexport safe */ _interceptors_response_type_interceptor__WEBPACK_IMPORTED_MODULE_4__.ResponseTypeInterceptor),
/* harmony export */   "TimeoutInterceptor": () => (/* reexport safe */ _interceptors_timeout_interceptor__WEBPACK_IMPORTED_MODULE_7__.TimeoutInterceptor),
/* harmony export */   "likeClientErrorAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__.likeClientErrorAwareHTTPInterceptor),
/* harmony export */   "likeInformationAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__.likeInformationAwareHTTPInterceptor),
/* harmony export */   "likeRedirectAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__.likeRedirectAwareHTTPInterceptor),
/* harmony export */   "likeServerErrorAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__.likeServerErrorAwareHTTPInterceptor),
/* harmony export */   "likeSuccessAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__.likeSuccessAwareHTTPInterceptor)
/* harmony export */ });
/* harmony import */ var _interceptors_response_class_interceptor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);
/* harmony import */ var _interceptors_response_code_interceptor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(11);
/* harmony import */ var _interceptors_content_type_interceptor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(12);
/* harmony import */ var _interceptors_data_parameter_interceptor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(14);
/* harmony import */ var _interceptors_response_type_interceptor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(18);
/* harmony import */ var _interceptors_if_modified_interceptor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(19);
/* harmony import */ var _interceptors_not_ok_interceptor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(20);
/* harmony import */ var _interceptors_timeout_interceptor__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(21);
/**
 * @author Jeff Rose
 */








//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3JzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ludGVyY2VwdG9ycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxjQUFjLDJDQUEyQyxDQUFDO0FBQzFELGNBQWMsMENBQTBDLENBQUM7QUFDekQsY0FBYyx5Q0FBeUMsQ0FBQztBQUN4RCxjQUFjLDJDQUEyQyxDQUFDO0FBQzFELGNBQWMsMENBQTBDLENBQUM7QUFDekQsY0FBYyx3Q0FBd0MsQ0FBQztBQUN2RCxjQUFjLG1DQUFtQyxDQUFDO0FBQ2xELGNBQWMsb0NBQW9DLENBQUMifQ==

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MappedResponseClassHTTPInterceptor": () => (/* binding */ MappedResponseClassHTTPInterceptor),
/* harmony export */   "likeClientErrorAwareHTTPInterceptor": () => (/* binding */ likeClientErrorAwareHTTPInterceptor),
/* harmony export */   "likeInformationAwareHTTPInterceptor": () => (/* binding */ likeInformationAwareHTTPInterceptor),
/* harmony export */   "likeRedirectAwareHTTPInterceptor": () => (/* binding */ likeRedirectAwareHTTPInterceptor),
/* harmony export */   "likeServerErrorAwareHTTPInterceptor": () => (/* binding */ likeServerErrorAwareHTTPInterceptor),
/* harmony export */   "likeSuccessAwareHTTPInterceptor": () => (/* binding */ likeSuccessAwareHTTPInterceptor)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _response_error__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _response_status__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MappedResponseClassHTTPInterceptor_interceptor, _MappedResponseClassHTTPInterceptor_hasInformationAwareInterceptor, _MappedResponseClassHTTPInterceptor_hasSuccessAwareInterceptor, _MappedResponseClassHTTPInterceptor_hasRedirectAwareInterceptor, _MappedResponseClassHTTPInterceptor_hasClientErrorAwareInterceptor, _MappedResponseClassHTTPInterceptor_hasServerErrorAwareInterceptor;



/**
 * @interface module:http.InformationAwareHTTPInterceptor
 */
/**
 * @function module:http.InformationAwareHTTPInterceptor#postInformationalResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.SuccessAwareHTTPInterceptor
 */
/**
 * @function module:http.SuccessAwareHTTPInterceptor#postSuccessfulResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.RedirectAwareHTTPInterceptor
 */
/**
 * @function module:http.RedirectAwareHTTPInterceptor#postRedirectResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.ClientErrorAwareHTTPInterceptor
 */
/**
 * @function module:http.ClientErrorAwareHTTPInterceptor#postClientErrorResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @interface module:http.ServerErrorAwareHTTPInterceptor
 */
/**
 * @function module:http.ServerErrorAwareHTTPInterceptor#postServerErrorResponse
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {external:Promise<module:core.JSONObject | undefined>}
 */
/**
 * @typedef {module:http.InformationAwareHTTPInterceptor|module:http.SuccessAwareHTTPInterceptor|module:http.RedirectAwareHTTPInterceptor|module:http.ClientErrorAwareHTTPInterceptor|module:http.ServerErrorAwareHTTPInterceptor} module:http.ResponseClassAwareHTTPInterceptor
 */
/**
 * @function module:http.likeInformationAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.InformationAwareHTTPInterceptor}.
 */
const likeInformationAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ postInformationalResponse: Function });
/**
 * @function module:http.likeSuccessAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.SuccessAwareHTTPInterceptor}.
 */
const likeSuccessAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ postSuccessfulResponse: Function });
/**
 * @function module:http.likeRedirectAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.RedirectAwareHTTPInterceptor}.
 */
const likeRedirectAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ postRedirectResponse: Function });
/**
 * @function module:http.likeClientErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ClientErrorAwareHTTPInterceptor}.
 */
const likeClientErrorAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ postClientErrorResponse: Function });
/**
 * @function module:http.likeServerErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ServerErrorAwareHTTPInterceptor}.
 */
const likeServerErrorAwareHTTPInterceptor = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ postServerErrorResponse: Function });
/**
 * @class module:http.MappedResponseClassHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseClassAwareHTTPInterceptor} interceptor
 */
class MappedResponseClassHTTPInterceptor {
    constructor(interceptor) {
        _MappedResponseClassHTTPInterceptor_interceptor.set(this, void 0);
        _MappedResponseClassHTTPInterceptor_hasInformationAwareInterceptor.set(this, void 0);
        _MappedResponseClassHTTPInterceptor_hasSuccessAwareInterceptor.set(this, void 0);
        _MappedResponseClassHTTPInterceptor_hasRedirectAwareInterceptor.set(this, void 0);
        _MappedResponseClassHTTPInterceptor_hasClientErrorAwareInterceptor.set(this, void 0);
        _MappedResponseClassHTTPInterceptor_hasServerErrorAwareInterceptor.set(this, void 0);
        __classPrivateFieldSet(this, _MappedResponseClassHTTPInterceptor_interceptor, interceptor, "f");
        __classPrivateFieldSet(this, _MappedResponseClassHTTPInterceptor_hasInformationAwareInterceptor, likeInformationAwareHTTPInterceptor(interceptor), "f");
        __classPrivateFieldSet(this, _MappedResponseClassHTTPInterceptor_hasSuccessAwareInterceptor, likeSuccessAwareHTTPInterceptor(interceptor), "f");
        __classPrivateFieldSet(this, _MappedResponseClassHTTPInterceptor_hasRedirectAwareInterceptor, likeRedirectAwareHTTPInterceptor(interceptor), "f");
        __classPrivateFieldSet(this, _MappedResponseClassHTTPInterceptor_hasClientErrorAwareInterceptor, likeClientErrorAwareHTTPInterceptor(interceptor), "f");
        __classPrivateFieldSet(this, _MappedResponseClassHTTPInterceptor_hasServerErrorAwareInterceptor, likeServerErrorAwareHTTPInterceptor(interceptor), "f");
    }
    /**
     * @readonly
     * @member {module:http.ResponseClassAwareHTTPInterceptor} module:http.MappedResponseClassHTTPInterceptor#interceptor
     */
    get interceptor() {
        return __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_interceptor, "f");
    }
    /**
     * @async
     * @function module:http.MappedResponseClassHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        if (response.ok && __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_hasSuccessAwareInterceptor, "f")) {
            await __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_interceptor, "f").postSuccessfulResponse(response, settings);
        }
        else {
            const status = _response_status__WEBPACK_IMPORTED_MODULE_1__["default"]["for"](response);
            if (status.isInformationClass && __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_hasInformationAwareInterceptor, "f")) {
                await __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_interceptor, "f").postInformationalResponse(response, settings);
            }
            else if (status.isRedirectClass && __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_hasRedirectAwareInterceptor, "f")) {
                await __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_interceptor, "f").postRedirectResponse(response, settings);
            }
            else if (status.isClientErrorClass && __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_hasClientErrorAwareInterceptor, "f")) {
                await __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_interceptor, "f").postClientErrorResponse(response, settings);
            }
            else if (status.isServerErrorClass && __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_hasServerErrorAwareInterceptor, "f")) {
                await __classPrivateFieldGet(this, _MappedResponseClassHTTPInterceptor_interceptor, "f").postServerErrorResponse(response, settings);
            }
            else if (response instanceof _response_error__WEBPACK_IMPORTED_MODULE_2__["default"]) {
                throw response;
            }
            else {
                throw new _response_error__WEBPACK_IMPORTED_MODULE_2__["default"](response, `Invalid status code: ${status.code}`);
            }
        }
    }
}
_MappedResponseClassHTTPInterceptor_interceptor = new WeakMap(), _MappedResponseClassHTTPInterceptor_hasInformationAwareInterceptor = new WeakMap(), _MappedResponseClassHTTPInterceptor_hasSuccessAwareInterceptor = new WeakMap(), _MappedResponseClassHTTPInterceptor_hasRedirectAwareInterceptor = new WeakMap(), _MappedResponseClassHTTPInterceptor_hasClientErrorAwareInterceptor = new WeakMap(), _MappedResponseClassHTTPInterceptor_hasServerErrorAwareInterceptor = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY2xhc3MtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW50ZXJjZXB0b3JzL3Jlc3BvbnNlLWNsYXNzLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUdILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxhQUFhLE1BQU0sbUJBQW1CLENBQUM7QUFDOUMsT0FBTyxjQUFjLE1BQU0sb0JBQW9CLENBQUM7QUE0QmhEOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7O0dBRUc7QUFFSDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxDQUFFLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxFQUFFLENBQTJELENBQUM7QUFFNUo7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLCtCQUErQixHQUFPLElBQUksQ0FBRSxFQUFFLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxDQUF1RCxDQUFDO0FBRXJKOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBTSxJQUFJLENBQUUsRUFBRSxvQkFBb0IsRUFBRSxRQUFRLEVBQUUsQ0FBd0QsQ0FBQztBQUVwSjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsSUFBSSxDQUFFLEVBQUUsdUJBQXVCLEVBQUUsUUFBUSxFQUFFLENBQTJELENBQUM7QUFFMUo7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1DQUFtQyxHQUFHLElBQUksQ0FBRSxFQUFFLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxDQUEyRCxDQUFDO0FBRTFKOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sa0NBQWtDO0lBZ0IzQyxZQUFhLFdBQVc7UUFmeEIsa0VBQWdEO1FBQ2hELHFGQUF5QztRQUN6QyxpRkFBcUM7UUFDckMsa0ZBQXNDO1FBQ3RDLHFGQUF5QztRQUN6QyxxRkFBeUM7UUFXckMsdUJBQUEsSUFBSSxtREFBZ0IsV0FBVyxNQUFBLENBQUM7UUFDaEMsdUJBQUEsSUFBSSxzRUFBbUMsbUNBQW1DLENBQUUsV0FBVyxDQUFFLE1BQUEsQ0FBQztRQUMxRix1QkFBQSxJQUFJLGtFQUErQiwrQkFBK0IsQ0FBRSxXQUFXLENBQUUsTUFBQSxDQUFDO1FBQ2xGLHVCQUFBLElBQUksbUVBQWdDLGdDQUFnQyxDQUFFLFdBQVcsQ0FBRSxNQUFBLENBQUM7UUFDcEYsdUJBQUEsSUFBSSxzRUFBbUMsbUNBQW1DLENBQUUsV0FBVyxDQUFFLE1BQUEsQ0FBQztRQUMxRix1QkFBQSxJQUFJLHNFQUFtQyxtQ0FBbUMsQ0FBRSxXQUFXLENBQUUsTUFBQSxDQUFDO0lBQzlGLENBQUM7SUFmRDs7O09BR0c7SUFDSCxJQUFJLFdBQVc7UUFDWCxPQUFPLHVCQUFBLElBQUksdURBQWEsQ0FBQztJQUM3QixDQUFDO0lBV0Q7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBRSxRQUFrQixFQUFFLFFBQWtCO1FBQ3RELElBQUksUUFBUSxDQUFDLEVBQUUsSUFBSSx1QkFBQSxJQUFJLHNFQUE0QixFQUFFO1lBQ2pELE1BQVEsdUJBQUEsSUFBSSx1REFBOEMsQ0FBQyxzQkFBc0IsQ0FBRSxRQUFRLEVBQUUsUUFBUSxDQUFFLENBQUM7U0FDM0c7YUFBTTtZQUNILE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQUUsUUFBUSxDQUFFLENBQUM7WUFDOUMsSUFBSSxNQUFNLENBQUMsa0JBQWtCLElBQUksdUJBQUEsSUFBSSwwRUFBZ0MsRUFBRTtnQkFDbkUsTUFBUSx1QkFBQSxJQUFJLHVEQUFrRCxDQUFDLHlCQUF5QixDQUFFLFFBQVEsRUFBRSxRQUFRLENBQUUsQ0FBQzthQUNsSDtpQkFBTSxJQUFJLE1BQU0sQ0FBQyxlQUFlLElBQUksdUJBQUEsSUFBSSx1RUFBNkIsRUFBRTtnQkFDcEUsTUFBUSx1QkFBQSxJQUFJLHVEQUErQyxDQUFDLG9CQUFvQixDQUFFLFFBQVEsRUFBRSxRQUFRLENBQUUsQ0FBQzthQUMxRztpQkFBTSxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsSUFBSSx1QkFBQSxJQUFJLDBFQUFnQyxFQUFFO2dCQUMxRSxNQUFRLHVCQUFBLElBQUksdURBQWtELENBQUMsdUJBQXVCLENBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBRSxDQUFDO2FBQ2hIO2lCQUFNLElBQUksTUFBTSxDQUFDLGtCQUFrQixJQUFJLHVCQUFBLElBQUksMEVBQWdDLEVBQUU7Z0JBQzFFLE1BQVEsdUJBQUEsSUFBSSx1REFBa0QsQ0FBQyx1QkFBdUIsQ0FBRSxRQUFRLEVBQUUsUUFBUSxDQUFFLENBQUM7YUFDaEg7aUJBQU0sSUFBSSxRQUFRLFlBQVksYUFBYSxFQUFFO2dCQUMxQyxNQUFNLFFBQVEsQ0FBQzthQUNsQjtpQkFBTTtnQkFDSCxNQUFNLElBQUksYUFBYSxDQUFFLFFBQVEsRUFBRSx3QkFBeUIsTUFBTSxDQUFDLElBQUssRUFBRSxDQUFFLENBQUM7YUFDaEY7U0FDSjtJQUNMLENBQUM7Q0FDSiJ9

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MappedResponseCodeHTTPInterceptor": () => (/* binding */ MappedResponseCodeHTTPInterceptor)
/* harmony export */ });
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MappedResponseCodeHTTPInterceptor_interceptor;
/**
 * @interface module:http.ResponseCodeAwareHTTPInterceptor
 */
/**
 * @class module:http.MappedResponseCodeHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseCodeAwareHTTPInterceptor} interceptor
 */
class MappedResponseCodeHTTPInterceptor {
    constructor(interceptor) {
        _MappedResponseCodeHTTPInterceptor_interceptor.set(this, void 0);
        __classPrivateFieldSet(this, _MappedResponseCodeHTTPInterceptor_interceptor, interceptor, "f");
    }
    /**
     * @readonly
     * @member {module:http.ResponseCodeAwareHTTPInterceptor} module:http.MappedResponseCodeHTTPInterceptor#interceptor
     */
    get interceptor() {
        return __classPrivateFieldGet(this, _MappedResponseCodeHTTPInterceptor_interceptor, "f");
    }
    /**
     * @async
     * @function module:http.MappedResponseCodeHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        const { status } = response;
        if (status in __classPrivateFieldGet(this, _MappedResponseCodeHTTPInterceptor_interceptor, "f")) {
            await __classPrivateFieldGet(this, _MappedResponseCodeHTTPInterceptor_interceptor, "f")[status](response, settings);
        }
    }
}
_MappedResponseCodeHTTPInterceptor_interceptor = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtY29kZS1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnRlcmNlcHRvcnMvcmVzcG9uc2UtY29kZS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7QUFZSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8saUNBQWlDO0lBVzFDLFlBQWEsV0FBNkM7UUFWMUQsaUVBQStDO1FBVzNDLHVCQUFBLElBQUksa0RBQWdCLFdBQVcsTUFBQSxDQUFDO0lBQ3BDLENBQUM7SUFWRDs7O09BR0c7SUFDSCxJQUFJLFdBQVc7UUFDWCxPQUFPLHVCQUFBLElBQUksc0RBQWEsQ0FBQztJQUM3QixDQUFDO0lBTUQ7Ozs7OztPQU1HO0lBQ0gsS0FBSyxDQUFDLFlBQVksQ0FBRSxRQUFrQixFQUFFLFFBQWtCO1FBQ3RELE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7UUFDNUIsSUFBSSxNQUFNLElBQUksdUJBQUEsSUFBSSxzREFBYSxFQUFFO1lBQzdCLE1BQU0sdUJBQUEsSUFBSSxzREFBYSxDQUFFLE1BQU0sQ0FBRSxDQUFFLFFBQVEsRUFBRSxRQUFRLENBQUUsQ0FBQztTQUMzRDtJQUNMLENBQUM7Q0FDSiJ9

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ContentTypeInterceptor": () => (/* binding */ ContentTypeInterceptor)
/* harmony export */ });
/* harmony import */ var _http_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/**
 * @author Jeff Rose
 */

/**
 * @typedef {module:http.HTTPInit} module:http.ContentTypeInit
 * @property {external:string | module:core.MediaType} [contentType] The `Content-Type` to append to request headers
 */
/**
 * @class module:http.ContentTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
class ContentTypeInterceptor {
    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @function module:http.ContentTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ContentTypeInit} settings The HTTP request settings, including the `contentType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        var _a;
        if ('contentType' in settings) {
            const { contentType } = settings, headers = new Headers((_a = settings.headers) !== null && _a !== void 0 ? _a : {});
            _http_headers__WEBPACK_IMPORTED_MODULE_0__.CONTENT_TYPE.set(headers, typeof contentType === 'string' ? contentType : contentType.toString());
            settings.headers = headers;
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC10eXBlLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ludGVyY2VwdG9ycy9jb250ZW50LXR5cGUtaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBSUgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSS9DOzs7R0FHRztBQUVIOzs7R0FHRztBQUNILE1BQU0sT0FBTyxzQkFBc0I7SUFDL0I7Ozs7OztPQU1HO0lBQ0gsT0FBTyxDQUFFLEdBQVEsRUFBRSxRQUF5Qjs7UUFDeEMsSUFBSSxhQUFhLElBQUksUUFBUSxFQUFFO1lBQzNCLE1BQ0ksRUFBRSxXQUFXLEVBQUUsR0FBRyxRQUFRLEVBQzFCLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBRSxNQUFBLFFBQVEsQ0FBQyxPQUFPLG1DQUFJLEVBQUUsQ0FBRSxDQUFDO1lBQ3BELFlBQVksQ0FBQyxHQUFHLENBQUUsT0FBTyxFQUFFLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQztZQUNwRyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztTQUM5QjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSiJ9

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ACCEPT": () => (/* binding */ ACCEPT),
/* harmony export */   "ACCEPT_CH": () => (/* binding */ ACCEPT_CH),
/* harmony export */   "ACCEPT_CHARSET": () => (/* binding */ ACCEPT_CHARSET),
/* harmony export */   "ACCEPT_CH_LIFETIME": () => (/* binding */ ACCEPT_CH_LIFETIME),
/* harmony export */   "ACCEPT_ENCODING": () => (/* binding */ ACCEPT_ENCODING),
/* harmony export */   "ACCEPT_PUSH_POLICY": () => (/* binding */ ACCEPT_PUSH_POLICY),
/* harmony export */   "ACCEPT_RANGES": () => (/* binding */ ACCEPT_RANGES),
/* harmony export */   "ACCEPT_SIGNATURE": () => (/* binding */ ACCEPT_SIGNATURE),
/* harmony export */   "ACCESS_CONTROL_ALLOW_CREDENTIALS": () => (/* binding */ ACCESS_CONTROL_ALLOW_CREDENTIALS),
/* harmony export */   "ACCESS_CONTROL_ALLOW_HEADERS": () => (/* binding */ ACCESS_CONTROL_ALLOW_HEADERS),
/* harmony export */   "ACCESS_CONTROL_ALLOW_METHODS": () => (/* binding */ ACCESS_CONTROL_ALLOW_METHODS),
/* harmony export */   "ACCESS_CONTROL_ALLOW_ORIGIN": () => (/* binding */ ACCESS_CONTROL_ALLOW_ORIGIN),
/* harmony export */   "ACCESS_CONTROL_EXPOSE_HEADERS": () => (/* binding */ ACCESS_CONTROL_EXPOSE_HEADERS),
/* harmony export */   "ACCESS_CONTROL_MAX_AGE": () => (/* binding */ ACCESS_CONTROL_MAX_AGE),
/* harmony export */   "ACCESS_CONTROL_REQUEST_HEADERS": () => (/* binding */ ACCESS_CONTROL_REQUEST_HEADERS),
/* harmony export */   "ACCESS_CONTROL_REQUEST_METHOD": () => (/* binding */ ACCESS_CONTROL_REQUEST_METHOD),
/* harmony export */   "AGE": () => (/* binding */ AGE),
/* harmony export */   "ALLOW": () => (/* binding */ ALLOW),
/* harmony export */   "ALT_SVC": () => (/* binding */ ALT_SVC),
/* harmony export */   "AUTHORIZATION": () => (/* binding */ AUTHORIZATION),
/* harmony export */   "CACHE_CONTROL": () => (/* binding */ CACHE_CONTROL),
/* harmony export */   "CLEAR_SITE_DATA": () => (/* binding */ CLEAR_SITE_DATA),
/* harmony export */   "CONNECTION": () => (/* binding */ CONNECTION),
/* harmony export */   "CONTENT_DISPOSITION": () => (/* binding */ CONTENT_DISPOSITION),
/* harmony export */   "CONTENT_ENCODING": () => (/* binding */ CONTENT_ENCODING),
/* harmony export */   "CONTENT_LANGUAGE": () => (/* binding */ CONTENT_LANGUAGE),
/* harmony export */   "CONTENT_LENGTH": () => (/* binding */ CONTENT_LENGTH),
/* harmony export */   "CONTENT_LOCATION": () => (/* binding */ CONTENT_LOCATION),
/* harmony export */   "CONTENT_RANGE": () => (/* binding */ CONTENT_RANGE),
/* harmony export */   "CONTENT_SECURITY_POLICY": () => (/* binding */ CONTENT_SECURITY_POLICY),
/* harmony export */   "CONTENT_SECURITY_POLICY_REPORT_ONLY": () => (/* binding */ CONTENT_SECURITY_POLICY_REPORT_ONLY),
/* harmony export */   "CONTENT_TYPE": () => (/* binding */ CONTENT_TYPE),
/* harmony export */   "COOKIE": () => (/* binding */ COOKIE),
/* harmony export */   "COOKIE2": () => (/* binding */ COOKIE2),
/* harmony export */   "CROSS_ORIGIN_EMBEDDER_POLICY": () => (/* binding */ CROSS_ORIGIN_EMBEDDER_POLICY),
/* harmony export */   "CROSS_ORIGIN_OPENER_POLICY": () => (/* binding */ CROSS_ORIGIN_OPENER_POLICY),
/* harmony export */   "CROSS_ORIGIN_RESOURCE_POLICY": () => (/* binding */ CROSS_ORIGIN_RESOURCE_POLICY),
/* harmony export */   "DATE": () => (/* binding */ DATE),
/* harmony export */   "DEVICE_MEMORY": () => (/* binding */ DEVICE_MEMORY),
/* harmony export */   "DNT": () => (/* binding */ DNT),
/* harmony export */   "EARLY_DATA": () => (/* binding */ EARLY_DATA),
/* harmony export */   "ETAG": () => (/* binding */ ETAG),
/* harmony export */   "EXPECT": () => (/* binding */ EXPECT),
/* harmony export */   "EXPECT_CT": () => (/* binding */ EXPECT_CT),
/* harmony export */   "EXPIRES": () => (/* binding */ EXPIRES),
/* harmony export */   "FEATURE_POLICY": () => (/* binding */ FEATURE_POLICY),
/* harmony export */   "FORWARDED": () => (/* binding */ FORWARDED),
/* harmony export */   "FROM": () => (/* binding */ FROM),
/* harmony export */   "HOST": () => (/* binding */ HOST),
/* harmony export */   "IF_MATCH": () => (/* binding */ IF_MATCH),
/* harmony export */   "IF_MODIFIED_SINCE": () => (/* binding */ IF_MODIFIED_SINCE),
/* harmony export */   "IF_NONE_MATCH": () => (/* binding */ IF_NONE_MATCH),
/* harmony export */   "IF_RANGE": () => (/* binding */ IF_RANGE),
/* harmony export */   "IF_UNMODIFIED_SINCE": () => (/* binding */ IF_UNMODIFIED_SINCE),
/* harmony export */   "KEEP_ALIVE": () => (/* binding */ KEEP_ALIVE),
/* harmony export */   "LARGE_ALLOCATION": () => (/* binding */ LARGE_ALLOCATION),
/* harmony export */   "LAST_EVENT_ID": () => (/* binding */ LAST_EVENT_ID),
/* harmony export */   "LAST_MODIFIED": () => (/* binding */ LAST_MODIFIED),
/* harmony export */   "LINK": () => (/* binding */ LINK),
/* harmony export */   "LOCATION": () => (/* binding */ LOCATION),
/* harmony export */   "MAX_FORWARDS": () => (/* binding */ MAX_FORWARDS),
/* harmony export */   "NEL": () => (/* binding */ NEL),
/* harmony export */   "ORIGIN": () => (/* binding */ ORIGIN),
/* harmony export */   "ORIGIN_ISOLATION": () => (/* binding */ ORIGIN_ISOLATION),
/* harmony export */   "PING_FROM": () => (/* binding */ PING_FROM),
/* harmony export */   "PING_TO": () => (/* binding */ PING_TO),
/* harmony export */   "PRAGMA": () => (/* binding */ PRAGMA),
/* harmony export */   "PROXY_AUTHENTICATE": () => (/* binding */ PROXY_AUTHENTICATE),
/* harmony export */   "PROXY_AUTHORIZATION": () => (/* binding */ PROXY_AUTHORIZATION),
/* harmony export */   "PUBLIC_KEY_PINS": () => (/* binding */ PUBLIC_KEY_PINS),
/* harmony export */   "PUBLIC_KEY_PINS_REPORT_ONLY": () => (/* binding */ PUBLIC_KEY_PINS_REPORT_ONLY),
/* harmony export */   "PUSH_POLICY": () => (/* binding */ PUSH_POLICY),
/* harmony export */   "RANGE": () => (/* binding */ RANGE),
/* harmony export */   "REFERER": () => (/* binding */ REFERER),
/* harmony export */   "REFERER_POLICY": () => (/* binding */ REFERER_POLICY),
/* harmony export */   "REPORT_TO": () => (/* binding */ REPORT_TO),
/* harmony export */   "RETRY_AFTER": () => (/* binding */ RETRY_AFTER),
/* harmony export */   "SAVE_DATA": () => (/* binding */ SAVE_DATA),
/* harmony export */   "SEC_FETCH_DEST": () => (/* binding */ SEC_FETCH_DEST),
/* harmony export */   "SEC_FETCH_MODE": () => (/* binding */ SEC_FETCH_MODE),
/* harmony export */   "SEC_FETCH_SITE": () => (/* binding */ SEC_FETCH_SITE),
/* harmony export */   "SEC_FETCH_USER": () => (/* binding */ SEC_FETCH_USER),
/* harmony export */   "SEC_WEBSOCKET_ACCEPT": () => (/* binding */ SEC_WEBSOCKET_ACCEPT),
/* harmony export */   "SEC_WEBSOCKET_EXTENSIONS": () => (/* binding */ SEC_WEBSOCKET_EXTENSIONS),
/* harmony export */   "SEC_WEBSOCKET_KEY": () => (/* binding */ SEC_WEBSOCKET_KEY),
/* harmony export */   "SEC_WEBSOCKET_PROTOCOL": () => (/* binding */ SEC_WEBSOCKET_PROTOCOL),
/* harmony export */   "SEC_WEBSOCKET_VERSION": () => (/* binding */ SEC_WEBSOCKET_VERSION),
/* harmony export */   "SERVER": () => (/* binding */ SERVER),
/* harmony export */   "SERVER_TIMING": () => (/* binding */ SERVER_TIMING),
/* harmony export */   "SERVICE_WORKER_ALLOWED": () => (/* binding */ SERVICE_WORKER_ALLOWED),
/* harmony export */   "SET_COOKIE": () => (/* binding */ SET_COOKIE),
/* harmony export */   "SET_COOKIE2": () => (/* binding */ SET_COOKIE2),
/* harmony export */   "SIGNATURE": () => (/* binding */ SIGNATURE),
/* harmony export */   "SIGNED_HEADERS": () => (/* binding */ SIGNED_HEADERS),
/* harmony export */   "SOURCEMAP": () => (/* binding */ SOURCEMAP),
/* harmony export */   "STRICT_TRANSPORT_SECURITY": () => (/* binding */ STRICT_TRANSPORT_SECURITY),
/* harmony export */   "TE": () => (/* binding */ TE),
/* harmony export */   "TIMING_ALLOW_ORIGIN": () => (/* binding */ TIMING_ALLOW_ORIGIN),
/* harmony export */   "TK": () => (/* binding */ TK),
/* harmony export */   "TRAILER": () => (/* binding */ TRAILER),
/* harmony export */   "TRANSFER_ENCODING": () => (/* binding */ TRANSFER_ENCODING),
/* harmony export */   "UGPRADE_INSECURE_REQUESTS": () => (/* binding */ UGPRADE_INSECURE_REQUESTS),
/* harmony export */   "UPGRADE": () => (/* binding */ UPGRADE),
/* harmony export */   "USER_AGENT": () => (/* binding */ USER_AGENT),
/* harmony export */   "VARY": () => (/* binding */ VARY),
/* harmony export */   "VIA": () => (/* binding */ VIA),
/* harmony export */   "VIEWPORT_WIDTH": () => (/* binding */ VIEWPORT_WIDTH),
/* harmony export */   "WARNING": () => (/* binding */ WARNING),
/* harmony export */   "WIDTH": () => (/* binding */ WIDTH),
/* harmony export */   "WWW_AUTHENTICATE": () => (/* binding */ WWW_AUTHENTICATE),
/* harmony export */   "X_CONTENT_TYPE_OPTIONS": () => (/* binding */ X_CONTENT_TYPE_OPTIONS),
/* harmony export */   "X_DNS_PREFETCH_CONTROL": () => (/* binding */ X_DNS_PREFETCH_CONTROL),
/* harmony export */   "X_DOWNLOAD_OPTIONS": () => (/* binding */ X_DOWNLOAD_OPTIONS),
/* harmony export */   "X_FORWARDED_FOR": () => (/* binding */ X_FORWARDED_FOR),
/* harmony export */   "X_FORWARDED_HOST": () => (/* binding */ X_FORWARDED_HOST),
/* harmony export */   "X_FORWARDED_PROTO": () => (/* binding */ X_FORWARDED_PROTO),
/* harmony export */   "X_FRAME_OPTIONS": () => (/* binding */ X_FRAME_OPTIONS),
/* harmony export */   "X_PERMITTED_CROSS_DOMAIN_POLICIES": () => (/* binding */ X_PERMITTED_CROSS_DOMAIN_POLICIES),
/* harmony export */   "X_PINGBACK": () => (/* binding */ X_PINGBACK),
/* harmony export */   "X_POWERED_BY": () => (/* binding */ X_POWERED_BY),
/* harmony export */   "X_REQUESTED_WITH": () => (/* binding */ X_REQUESTED_WITH),
/* harmony export */   "X_ROBOTS_TAG": () => (/* binding */ X_ROBOTS_TAG),
/* harmony export */   "X_UA_COMPATIBLE": () => (/* binding */ X_UA_COMPATIBLE),
/* harmony export */   "X_XSS_PROTECTION": () => (/* binding */ X_XSS_PROTECTION)
/* harmony export */ });
/* harmony import */ var _http_header__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8);
/**
 * @author Jeff Rose
 */

/**
 * @namespace module:http.HTTPHeaders
 */
/**
 * Authentication
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WWW_AUTHENTICATE
 */
const WWW_AUTHENTICATE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('WWW-Authenticate');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.AUTHORIZATION
 */
const AUTHORIZATION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Authorization');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PROXY_AUTHENTICATE
 */
const PROXY_AUTHENTICATE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Proxy-Authenticate');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PROXY_AUTHORIZATION
 */
const PROXY_AUTHORIZATION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Proxy-Authorization');
/**
 * Caching
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.AGE
 */
const AGE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Age');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CACHE_CONTROL
 */
const CACHE_CONTROL = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Cache-Control');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CLEAR_SITE_DATA
 */
const CLEAR_SITE_DATA = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Clear-Site-Data');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPIRES
 */
const EXPIRES = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Expires');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PRAGMA
 */
const PRAGMA = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Pragma');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WARNING
 */
const WARNING = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Warning');
/**
 * Client Hints
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CH
 */
const ACCEPT_CH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-CH');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CH_LIFETIME
 */
const ACCEPT_CH_LIFETIME = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-CH-Lifetime');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EARLY_DATA
 */
const EARLY_DATA = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Early-Data');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DEVICE_MEMORY
 */
const DEVICE_MEMORY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Device-Memory');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SAVE_DATA
 */
const SAVE_DATA = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Save-Data');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VIEWPORT_WIDTH
 */
const VIEWPORT_WIDTH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Viewport-Width');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WIDTH
 */
const WIDTH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Width');
/**
 * Conditionals
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LAST_MODIFIED
 */
const LAST_MODIFIED = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Last-Modified');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ETAG
 */
const ETAG = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('ETag');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_MATCH
 */
const IF_MATCH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('If-Match');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_NONE_MATCH
 */
const IF_NONE_MATCH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('If-None-Match');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_MODIFIED_SINCE
 */
const IF_MODIFIED_SINCE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('If-Modified-Since');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_UNMODIFIED_SINCE
 */
const IF_UNMODIFIED_SINCE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('If-Unmodified-Since');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VARY
 */
const VARY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Vary');
/**
 * Content management
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONNECTION
 */
const CONNECTION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Connection');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.KEEP_ALIVE
 */
const KEEP_ALIVE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Keep-Alive');
/**
 * Content negotiation
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT
 */
const ACCEPT = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CHARSET
 */
const ACCEPT_CHARSET = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-Charset');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_ENCODING
 */
const ACCEPT_ENCODING = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-Encoding');
/**
 * Controls
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPECT
 */
const EXPECT = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Expect');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.MAX_FORWARDS
 */
const MAX_FORWARDS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Max-Forwards');
/**
 * Cookies
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.COOKIE
 */
const COOKIE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Cookie');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SET_COOKIE
 */
const SET_COOKIE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Set-Cookie');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.COOKIE2
 */
const COOKIE2 = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Cookie2');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SET_COOKIE2
 */
const SET_COOKIE2 = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Set-Cookie2');
/**
 * CORS
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_ORIGIN
 */
const ACCESS_CONTROL_ALLOW_ORIGIN = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Allow-Origin');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS
 */
const ACCESS_CONTROL_ALLOW_CREDENTIALS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Allow-Credentials');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_HEADERS
 */
const ACCESS_CONTROL_ALLOW_HEADERS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Allow-Headers');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_METHODS
 */
const ACCESS_CONTROL_ALLOW_METHODS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Allow-Methods');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_EXPOSE_HEADERS
 */
const ACCESS_CONTROL_EXPOSE_HEADERS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Expose-Headers');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_MAX_AGE
 */
const ACCESS_CONTROL_MAX_AGE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Max-Age');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_REQUEST_HEADERS
 */
const ACCESS_CONTROL_REQUEST_HEADERS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Request-Headers');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_REQUEST_METHOD
 */
const ACCESS_CONTROL_REQUEST_METHOD = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Access-Control-Request-Method');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ORIGIN
 */
const ORIGIN = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Origin');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TIMING_ALLOW_ORIGIN
 */
const TIMING_ALLOW_ORIGIN = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Timing-Allow-Origin');
/**
 * Do Not Track
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DNT
 */
const DNT = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('DNT');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TK
 */
const TK = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Tk');
/**
 * Downloads
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_DISPOSITION
 */
const CONTENT_DISPOSITION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Disposition');
/**
 * Message body information
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LENGTH
 */
const CONTENT_LENGTH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Length');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_TYPE
 */
const CONTENT_TYPE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Type');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_ENCODING
 */
const CONTENT_ENCODING = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Encoding');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LANGUAGE
 */
const CONTENT_LANGUAGE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Language');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LOCATION
 */
const CONTENT_LOCATION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Location');
/**
 * Proxies
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FORWARDED
 */
const FORWARDED = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Forwarded');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_FOR
 */
const X_FORWARDED_FOR = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Forwarded-For');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_HOST
 */
const X_FORWARDED_HOST = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Forwarded-Host');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_PROTO
 */
const X_FORWARDED_PROTO = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Forwarded-Proto');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VIA
 */
const VIA = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Via');
/**
 * Redirects
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LOCATION
 */
const LOCATION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Location');
/**
 * Request context
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FROM
 */
const FROM = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('From');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.HOST
 */
const HOST = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Host');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REFERER
 */
const REFERER = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Referer');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REFERER_POLICY
 */
const REFERER_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Referer-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.USER_AGENT
 */
const USER_AGENT = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('User-Agent');
/**
 * Response context
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ALLOW
 */
const ALLOW = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Allow');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVER
 */
const SERVER = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Server');
/**
 * Range requests
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_RANGES
 */
const ACCEPT_RANGES = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-Ranges');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.RANGE
 */
const RANGE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Range');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_RANGE
 */
const IF_RANGE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('If-Range');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_RANGE
 */
const CONTENT_RANGE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Range');
/**
 * Security
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_EMBEDDER_POLICY
 */
const CROSS_ORIGIN_EMBEDDER_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Cross-Origin-Embedder-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_OPENER_POLICY
 */
const CROSS_ORIGIN_OPENER_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Cross-Origin-Opener-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_RESOURCE_POLICY
 */
const CROSS_ORIGIN_RESOURCE_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Cross-Origin-Resource-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_SECURITY_POLICY
 */
const CONTENT_SECURITY_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Security-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_SECURITY_POLICY_REPORT_ONLY
 */
const CONTENT_SECURITY_POLICY_REPORT_ONLY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Content-Security-Policy-Report-Only');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPECT_CT
 */
const EXPECT_CT = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Expect-CT');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FEATURE_POLICY
 */
const FEATURE_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Feature-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ORIGIN_ISOLATION
 */
const ORIGIN_ISOLATION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Origin-Isolation');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.STRICT_TRANSPORT_SECURITY
 */
const STRICT_TRANSPORT_SECURITY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Strict-Transport-Security');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.UGPRADE_INSECURE_REQUESTS
 */
const UGPRADE_INSECURE_REQUESTS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Upgrade-Insecure-Requests');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_CONTENT_TYPE_OPTIONS
 */
const X_CONTENT_TYPE_OPTIONS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Content-Type-Options');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_DOWNLOAD_OPTIONS
 */
const X_DOWNLOAD_OPTIONS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Download-Options');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FRAME_OPTIONS
 */
const X_FRAME_OPTIONS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Frame-Options');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_PERMITTED_CROSS_DOMAIN_POLICIES
 */
const X_PERMITTED_CROSS_DOMAIN_POLICIES = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Permitted-Cross-Domain-Policies');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_POWERED_BY
 */
const X_POWERED_BY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Powered-By');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_XSS_PROTECTION
 */
const X_XSS_PROTECTION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-XSS-Protection');
/**
 * HTTP Public Key Pinning (HPKP)
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUBLIC_KEY_PINS
 */
const PUBLIC_KEY_PINS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Public-Key-Pins');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUBLIC_KEY_PINS_REPORT_ONLY
 */
const PUBLIC_KEY_PINS_REPORT_ONLY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Public-Key-Pins-Report-Only');
/**
 * Fetch metadata request headers
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_SITE
 */
const SEC_FETCH_SITE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-Fetch-Site');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_MODE
 */
const SEC_FETCH_MODE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-Fetch-Mode');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_USER
 */
const SEC_FETCH_USER = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-Fetch-User');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_DEST
 */
const SEC_FETCH_DEST = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-Fetch-Dest');
/**
 * Server-sent requests
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LAST_EVENT_ID
 */
const LAST_EVENT_ID = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Last-Event-Id');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.NEL
 */
const NEL = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('NEL');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PING_FROM
 */
const PING_FROM = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Ping-From');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PING_TO
 */
const PING_TO = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Ping-To');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REPORT_TO
 */
const REPORT_TO = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Report-To');
/**
 * Transfer coding
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TRANSFER_ENCODING
 */
const TRANSFER_ENCODING = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Transfer-Encoding');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TE
 */
const TE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('TE');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TRAILER
 */
const TRAILER = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Trailer');
/**
 * Websockets
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_KEY
 */
const SEC_WEBSOCKET_KEY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-WebSocket-Key');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_EXTENSIONS
 */
const SEC_WEBSOCKET_EXTENSIONS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-WebSocket-Extensions');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_ACCEPT
 */
const SEC_WEBSOCKET_ACCEPT = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-WebSocket-Accept');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_PROTOCOL
 */
const SEC_WEBSOCKET_PROTOCOL = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-WebSocket-Protocol');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_VERSION
 */
const SEC_WEBSOCKET_VERSION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Sec-WebSocket-Version');
/**
 * Other
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_PUSH_POLICY
 */
const ACCEPT_PUSH_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-Push-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_SIGNATURE
 */
const ACCEPT_SIGNATURE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Accept-Signature');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ALT_SVC
 */
const ALT_SVC = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Alt-Svc');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DATE
 */
const DATE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Date');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LARGE_ALLOCATION
 */
const LARGE_ALLOCATION = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Large-Allocation');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LINK
 */
const LINK = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Link');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUSH_POLICY
 */
const PUSH_POLICY = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Push-Policy');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.RETRY_AFTER
 */
const RETRY_AFTER = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Retry-After');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SIGNATURE
 */
const SIGNATURE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Signature');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SIGNED_HEADERS
 */
const SIGNED_HEADERS = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Signed-Headers');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVER_TIMING
 */
const SERVER_TIMING = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Server-Timing');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVICE_WORKER_ALLOWED
 */
const SERVICE_WORKER_ALLOWED = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Service-Worker-Allowed');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SOURCEMAP
 */
const SOURCEMAP = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('SourceMap');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.UPGRADE
 */
const UPGRADE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('Upgrade');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_DNS_PREFETCH_CONTROL
 */
const X_DNS_PREFETCH_CONTROL = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-DNS-Prefetch-Control');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_PINGBACK
 */
const X_PINGBACK = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Pingback');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_REQUESTED_WITH
 */
const X_REQUESTED_WITH = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Requested-With');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_ROBOTS_TAG
 */
const X_ROBOTS_TAG = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-Robots-Tag');
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_UA_COMPATIBLE
 */
const X_UA_COMPATIBLE = new _http_header__WEBPACK_IMPORTED_MODULE_0__.HTTPHeader('X-UA-Compatible');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1oZWFkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2h0dHAtaGVhZGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksVUFBVSxDQUFFLGtCQUFrQixDQUFFLENBQUM7QUFFckU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUUsZUFBZSxDQUFFLENBQUM7QUFFL0Q7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxvQkFBb0IsQ0FBRSxDQUFDO0FBRXpFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxVQUFVLENBQUUscUJBQXFCLENBQUUsQ0FBQztBQUUzRTs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFFLEtBQUssQ0FBRSxDQUFDO0FBRTNDOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFFLGVBQWUsQ0FBRSxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLElBQUksVUFBVSxDQUFFLGlCQUFpQixDQUFFLENBQUM7QUFFbkU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxVQUFVLENBQUUsU0FBUyxDQUFFLENBQUM7QUFFbkQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUUsUUFBUSxDQUFFLENBQUM7QUFFakQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxVQUFVLENBQUUsU0FBUyxDQUFFLENBQUM7QUFFbkQ7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUV2RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksVUFBVSxDQUFFLG9CQUFvQixDQUFFLENBQUM7QUFFekU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUUsWUFBWSxDQUFFLENBQUM7QUFFekQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUUsZUFBZSxDQUFFLENBQUM7QUFFL0Q7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUUsV0FBVyxDQUFFLENBQUM7QUFFdkQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxVQUFVLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztBQUVqRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLEtBQUssR0FBRyxJQUFJLFVBQVUsQ0FBRSxPQUFPLENBQUUsQ0FBQztBQUUvQzs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFFLGVBQWUsQ0FBRSxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksVUFBVSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0FBRTdDOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksVUFBVSxDQUFFLFVBQVUsQ0FBRSxDQUFDO0FBRXJEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFFLGVBQWUsQ0FBRSxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUUsbUJBQW1CLENBQUUsQ0FBQztBQUV2RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLElBQUksVUFBVSxDQUFFLHFCQUFxQixDQUFFLENBQUM7QUFFM0U7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUM7QUFFN0M7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBRSxZQUFZLENBQUUsQ0FBQztBQUV6RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBRSxZQUFZLENBQUUsQ0FBQztBQUV6RDs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxDQUFFLGdCQUFnQixDQUFFLENBQUM7QUFFakU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxVQUFVLENBQUUsaUJBQWlCLENBQUUsQ0FBQztBQUVuRTs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksVUFBVSxDQUFFLGNBQWMsQ0FBRSxDQUFDO0FBRTdEOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxVQUFVLENBQUUsUUFBUSxDQUFFLENBQUM7QUFFakQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUUsWUFBWSxDQUFFLENBQUM7QUFFekQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxVQUFVLENBQUUsU0FBUyxDQUFFLENBQUM7QUFFbkQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxVQUFVLENBQUUsYUFBYSxDQUFFLENBQUM7QUFFM0Q7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLDJCQUEyQixHQUFHLElBQUksVUFBVSxDQUFFLDZCQUE2QixDQUFFLENBQUM7QUFFM0Y7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQ0FBZ0MsR0FBRyxJQUFJLFVBQVUsQ0FBRSxrQ0FBa0MsQ0FBRSxDQUFDO0FBRXJHOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxVQUFVLENBQUUsOEJBQThCLENBQUUsQ0FBQztBQUU3Rjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLElBQUksVUFBVSxDQUFFLDhCQUE4QixDQUFFLENBQUM7QUFFN0Y7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLFVBQVUsQ0FBRSwrQkFBK0IsQ0FBRSxDQUFDO0FBRS9GOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUUsd0JBQXdCLENBQUUsQ0FBQztBQUVqRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLDhCQUE4QixHQUFHLElBQUksVUFBVSxDQUFFLGdDQUFnQyxDQUFFLENBQUM7QUFFakc7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxJQUFJLFVBQVUsQ0FBRSwrQkFBK0IsQ0FBRSxDQUFDO0FBRS9GOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxVQUFVLENBQUUscUJBQXFCLENBQUUsQ0FBQztBQUUzRTs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFFLEtBQUssQ0FBRSxDQUFDO0FBRTNDOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksVUFBVSxDQUFFLElBQUksQ0FBRSxDQUFDO0FBRXpDOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLFVBQVUsQ0FBRSxxQkFBcUIsQ0FBRSxDQUFDO0FBRTNFOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxVQUFVLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztBQUVqRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBRSxjQUFjLENBQUUsQ0FBQztBQUU3RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksVUFBVSxDQUFFLGtCQUFrQixDQUFFLENBQUM7QUFFckU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBRXJFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxVQUFVLENBQUUsa0JBQWtCLENBQUUsQ0FBQztBQUVyRTs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksVUFBVSxDQUFFLFdBQVcsQ0FBRSxDQUFDO0FBRXZEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLElBQUksVUFBVSxDQUFFLGlCQUFpQixDQUFFLENBQUM7QUFFbkU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBRXJFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUUsbUJBQW1CLENBQUUsQ0FBQztBQUV2RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBRSxLQUFLLENBQUUsQ0FBQztBQUUzQzs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksVUFBVSxDQUFFLFVBQVUsQ0FBRSxDQUFDO0FBRXJEOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUM7QUFFN0M7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUM7QUFFN0M7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsSUFBSSxVQUFVLENBQUUsU0FBUyxDQUFFLENBQUM7QUFFbkQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxVQUFVLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztBQUVqRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxJQUFJLFVBQVUsQ0FBRSxZQUFZLENBQUUsQ0FBQztBQUV6RDs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLElBQUksVUFBVSxDQUFFLE9BQU8sQ0FBRSxDQUFDO0FBRS9DOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sTUFBTSxHQUFHLElBQUksVUFBVSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBRWpEOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUUsZUFBZSxDQUFFLENBQUM7QUFFL0Q7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUUsT0FBTyxDQUFFLENBQUM7QUFFL0M7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUcsSUFBSSxVQUFVLENBQUUsVUFBVSxDQUFFLENBQUM7QUFFckQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsSUFBSSxVQUFVLENBQUUsZUFBZSxDQUFFLENBQUM7QUFFL0Q7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLDRCQUE0QixHQUFHLElBQUksVUFBVSxDQUFFLDhCQUE4QixDQUFFLENBQUM7QUFFN0Y7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLFVBQVUsQ0FBRSw0QkFBNEIsQ0FBRSxDQUFDO0FBRXpGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxVQUFVLENBQUUsOEJBQThCLENBQUUsQ0FBQztBQUU3Rjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFHLElBQUksVUFBVSxDQUFFLHlCQUF5QixDQUFFLENBQUM7QUFFbkY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQ0FBbUMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxxQ0FBcUMsQ0FBRSxDQUFDO0FBRTNHOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLElBQUksVUFBVSxDQUFFLFdBQVcsQ0FBRSxDQUFDO0FBRXZEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxDQUFFLGdCQUFnQixDQUFFLENBQUM7QUFFakU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBRXJFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxVQUFVLENBQUUsMkJBQTJCLENBQUUsQ0FBQztBQUV2Rjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHlCQUF5QixHQUFHLElBQUksVUFBVSxDQUFFLDJCQUEyQixDQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSx3QkFBd0IsQ0FBRSxDQUFDO0FBRWpGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxVQUFVLENBQUUsb0JBQW9CLENBQUUsQ0FBQztBQUV6RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLFVBQVUsQ0FBRSxpQkFBaUIsQ0FBRSxDQUFDO0FBRW5FOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUNBQWlDLEdBQUcsSUFBSSxVQUFVLENBQUUsbUNBQW1DLENBQUUsQ0FBQztBQUV2Rzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxJQUFJLFVBQVUsQ0FBRSxjQUFjLENBQUUsQ0FBQztBQUU3RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLElBQUksVUFBVSxDQUFFLGtCQUFrQixDQUFFLENBQUM7QUFFckU7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxJQUFJLFVBQVUsQ0FBRSxpQkFBaUIsQ0FBRSxDQUFDO0FBRW5FOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsSUFBSSxVQUFVLENBQUUsNkJBQTZCLENBQUUsQ0FBQztBQUUzRjs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxDQUFFLGdCQUFnQixDQUFFLENBQUM7QUFFakU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsSUFBSSxVQUFVLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztBQUVqRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO0FBRWpFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksVUFBVSxDQUFFLGdCQUFnQixDQUFFLENBQUM7QUFFakU7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLFVBQVUsQ0FBRSxlQUFlLENBQUUsQ0FBQztBQUUvRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBRSxLQUFLLENBQUUsQ0FBQztBQUUzQzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUV2RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUVuRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUV2RDs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUUsbUJBQW1CLENBQUUsQ0FBQztBQUV2RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLFVBQVUsQ0FBRSxJQUFJLENBQUUsQ0FBQztBQUV6Qzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUVuRDs7R0FFRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUUsbUJBQW1CLENBQUUsQ0FBQztBQUV2RTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFHLElBQUksVUFBVSxDQUFFLDBCQUEwQixDQUFFLENBQUM7QUFFckY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxvQkFBb0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxzQkFBc0IsQ0FBRSxDQUFDO0FBRTdFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUUsd0JBQXdCLENBQUUsQ0FBQztBQUVqRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLElBQUksVUFBVSxDQUFFLHVCQUF1QixDQUFFLENBQUM7QUFFL0U7O0dBRUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLElBQUksVUFBVSxDQUFFLG9CQUFvQixDQUFFLENBQUM7QUFFekU7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBRXJFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLElBQUksVUFBVSxDQUFFLFNBQVMsQ0FBRSxDQUFDO0FBRW5EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLElBQUksVUFBVSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0FBRTdDOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxVQUFVLENBQUUsa0JBQWtCLENBQUUsQ0FBQztBQUVyRTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLFVBQVUsQ0FBRSxNQUFNLENBQUUsQ0FBQztBQUU3Qzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBRSxhQUFhLENBQUUsQ0FBQztBQUUzRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxJQUFJLFVBQVUsQ0FBRSxhQUFhLENBQUUsQ0FBQztBQUUzRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUV2RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO0FBRWpFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLElBQUksVUFBVSxDQUFFLGVBQWUsQ0FBRSxDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sc0JBQXNCLEdBQUcsSUFBSSxVQUFVLENBQUUsd0JBQXdCLENBQUUsQ0FBQztBQUVqRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUV2RDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxJQUFJLFVBQVUsQ0FBRSxTQUFTLENBQUUsQ0FBQztBQUVuRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHLElBQUksVUFBVSxDQUFFLHdCQUF3QixDQUFFLENBQUM7QUFFakY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxVQUFVLENBQUUsWUFBWSxDQUFFLENBQUM7QUFFekQ7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLFVBQVUsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBRXJFOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLElBQUksVUFBVSxDQUFFLGNBQWMsQ0FBRSxDQUFDO0FBRTdEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLElBQUksVUFBVSxDQUFFLGlCQUFpQixDQUFFLENBQUMifQ==

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DataParameterInterceptor": () => (/* binding */ DataParameterInterceptor)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _query_string__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(15);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */



/**
 * @typedef {module:http.HTTPInit} module:http.DataParameterInit
 * @property {external:BodyInit} [data]
 */
/**
 * * This interceptor could be more robust, e.g. it could do additional data processing,
 * * set a consistent Content-Type header, and/or read an existing Content-Type header
 * * to affect processing. -JBR
 */
const getEntries = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)((0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.ifElse)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isString, _query_string__WEBPACK_IMPORTED_MODULE_2__["default"].parse, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity), _blue_core__WEBPACK_IMPORTED_MODULE_1__.entriesIterator), getOrHead = /^(GET|HEAD)$/i, isBodyless = (method) => getOrHead.test(method), isArrayBuffer = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(ArrayBuffer), isDataView = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(DataView), isTypedArray = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.anyPass)([
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Float32Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Float64Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Int8Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Int16Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Int32Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Uint8Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Uint8ClampedArray),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Uint16Array),
    (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Uint32Array)
]), isArrayBufferView = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.either)(isTypedArray, isDataView), isBufferSource = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.either)(isArrayBuffer, isArrayBufferView), isBlob = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(Blob), isFormData = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(FormData), isURLSearchParams = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(URLSearchParams), isReadableStream = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.is)(ReadableStream),
/*
 * parseData() could be turned into an ifElse() where the identity() results are joined within an anyPass()...
 * ifElse( anyPass( [ isBlob, isBufferSource, ... ] ), identity, JSON.stringify );
 * I don't know if there are performance implications to either approach but I thought this approach laid out the logic more clearly.
 * -JBR
 */
parseData = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
    [isBlob, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [isBufferSource, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [isFormData, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [_blue_util__WEBPACK_IMPORTED_MODULE_0__.isString, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [isURLSearchParams, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [isReadableStream, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, JSON.stringify]
]);
/**
 * @class module:http.DataParameterInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
class DataParameterInterceptor {
    /**
     * module:http.DataParameterInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.DataParameterInit} settings The HTTP request settings, including the `data` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        if ('data' in settings) {
            const { data, method } = settings;
            if (isBodyless(method)) {
                const entries = getEntries(data);
                if (entries) {
                    for (const [key, value] of entries) {
                        url.searchParams.set(String(key), String(value));
                    }
                }
            }
            else {
                settings.body = parseData(data);
            }
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1wYXJhbWV0ZXItaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW50ZXJjZXB0b3JzL2RhdGEtcGFyYW1ldGVyLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLFlBQVksQ0FBQztBQUM1RixPQUFPLFdBQVcsTUFBTSxpQkFBaUIsQ0FBQztBQUUxQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSzdDOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSCxNQUNJLFVBQVUsR0FBRyxJQUFJLENBQUUsTUFBTSxDQUFFLFFBQVEsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBRSxFQUFFLGVBQWUsQ0FBRSxFQUNyRixTQUFTLEdBQUcsZUFBZSxFQUMzQixVQUFVLEdBQUcsQ0FBRSxNQUFrQixFQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFFLE1BQU0sQ0FBRSxFQUN4RSxhQUFhLEdBQUcsRUFBRSxDQUFFLFdBQVcsQ0FBRSxFQUNqQyxVQUFVLEdBQUcsRUFBRSxDQUFFLFFBQVEsQ0FBRSxFQUMzQixZQUFZLEdBQUcsT0FBTyxDQUFFO0lBQ3BCLEVBQUUsQ0FBRSxZQUFZLENBQUU7SUFDbEIsRUFBRSxDQUFFLFlBQVksQ0FBRTtJQUNsQixFQUFFLENBQUUsU0FBUyxDQUFFO0lBQ2YsRUFBRSxDQUFFLFVBQVUsQ0FBRTtJQUNoQixFQUFFLENBQUUsVUFBVSxDQUFFO0lBQ2hCLEVBQUUsQ0FBRSxVQUFVLENBQUU7SUFDaEIsRUFBRSxDQUFFLGlCQUFpQixDQUFFO0lBQ3ZCLEVBQUUsQ0FBRSxXQUFXLENBQUU7SUFDakIsRUFBRSxDQUFFLFdBQVcsQ0FBRTtDQUNwQixDQUFFLEVBQ0gsaUJBQWlCLEdBQUcsTUFBTSxDQUFFLFlBQVksRUFBRSxVQUFVLENBQUUsRUFDdEQsY0FBYyxHQUFHLE1BQU0sQ0FBRSxhQUFhLEVBQUUsaUJBQWlCLENBQUUsRUFDM0QsTUFBTSxHQUFHLEVBQUUsQ0FBRSxJQUFJLENBQUUsRUFDbkIsVUFBVSxHQUFHLEVBQUUsQ0FBRSxRQUFRLENBQUUsRUFDM0IsaUJBQWlCLEdBQUcsRUFBRSxDQUFFLGVBQWUsQ0FBRSxFQUN6QyxnQkFBZ0IsR0FBRyxFQUFFLENBQUUsY0FBYyxDQUFFO0FBQ3ZDOzs7OztHQUtHO0FBQ0gsU0FBUyxHQUFHLElBQUksQ0FBRTtJQUNkLENBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBRTtJQUNwQixDQUFFLGNBQWMsRUFBRSxRQUFRLENBQUU7SUFDNUIsQ0FBRSxVQUFVLEVBQUUsUUFBUSxDQUFFO0lBQ3hCLENBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBRTtJQUN0QixDQUFFLGlCQUFpQixFQUFFLFFBQVEsQ0FBRTtJQUMvQixDQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBRTtJQUM5QixDQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFFO0NBQ3hCLENBQXFDLENBQUM7QUFFM0M7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHdCQUF3QjtJQUNqQzs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBRSxHQUFRLEVBQUUsUUFBMkI7UUFDMUMsSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFO1lBQ3BCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLElBQUksVUFBVSxDQUFFLE1BQU0sQ0FBRSxFQUFFO2dCQUN0QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUUsSUFBSSxDQUFFLENBQUM7Z0JBQ25DLElBQUksT0FBTyxFQUFFO29CQUNULEtBQUssTUFBTSxDQUFFLEdBQUcsRUFBRSxLQUFLLENBQUUsSUFBSSxPQUFPLEVBQUU7d0JBQ2xDLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFFLE1BQU0sQ0FBRSxHQUFHLENBQUUsRUFBRSxNQUFNLENBQUUsS0FBSyxDQUFFLENBQUUsQ0FBQztxQkFDMUQ7aUJBQ0o7YUFDSjtpQkFBTTtnQkFDSCxRQUFRLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBRSxJQUFJLENBQUUsQ0FBQzthQUNyQztTQUNKO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _parsers_query_expression__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);


//import { JSONValue, DelegatingTransformer, Reduced, Transformer } from '@blue/core';
/*
import { addIndex, complement, cond, equals, ifElse, isEmpty, filter, pipe, join, keys, map, sort, T } from 'ramda';

const
    //bracketMatcher: RegExp = /(\[\])$/,
    //indexMatcher: RegExp = /\[(\d*)\]$/,

    alphabeticalAscending = ( a, b ) => a.codePointAt( 0 ) - b.codePointAt( 0 ),
    indexedMap = addIndex( map ),
    isNotEmpty = complement( isEmpty ),
    isNull = equals( null ),
    isUndefined = equals( undefined ),
    joinOnAmpersand = join( '&' ),
    removeEmpty = filter( isNotEmpty ),

    // ?foo[]=bar&foo[]=baz
    createBracketParameter = ( key, value, index? ) => ifElse(
        isNull,
        () => encode( key ),
        () => `${ encode( key ) }[]=${ encode( value ) }`
    )( value ),

    // ?foo=bar&foo=baz
    createParameter = ( key, value, index? ) => ifElse(
        isNull,
        () => encode( key ),
        () => `${ encode( key ) }=${ encode( value ) }`
    )( value ),

    // ?foo[0]=bar&foo[1]=baz
    createIndexParameter = ( key, value, index ) => ifElse(
        isNull,
        () => `${ encode( key ) }[${ index }]`,
        () => `${ encode( key ) }[${ encode( String( index ) ) }]=${ encode( value ) }`
    )( value ),

    getListParameterStringifier = ( format ) => cond( [
        [ equals( 'bracket' ) , () => createBracketParameter ],
        [ equals( 'index' )   , () => createIndexParameter ],
        [ T                   , () => createParameter ]
    ] )( format ),

    encodeValueList = ( key, list ) => pipe(
        indexedMap( ( value, index ) => createParameter( key, value, index ) ),
        removeEmpty,
        joinOnAmpersand
    )( list ),

    toQueryString = ( object ) => pipe(
        keys,
        sort( alphabeticalAscending ),
        map( ( key ) => cond( [
            [ isUndefined   , () => '' ],
            [ Array.isArray , () => encodeValueList( key, object[ key ] ) ],
            [ T             , () => createParameter( key, object[ key ] ) ]
        ] ) ),
        removeEmpty,
        joinOnAmpersand
    )( object );

//toQueryString( { e:6, a:1, b:2, c:[3,4], d: 5} ); // a=1&b=2&c=3&c=4&d=5&e=6

export default toQueryString;
*/
const isNotEmpty = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isEmpty), arrayStringifier = (key, value, index) => value === null ? (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key) : `${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key)}=${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(value)}`, toQueryString = (object) => object ? Object
    .keys(object)
    .sort()
    .map(function (key) {
    const value = object[key];
    if (value === undefined) {
        return '';
    }
    if (value === null) {
        return (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key);
    }
    if (Array.isArray(value)) {
        const result = [];
        value.slice().forEach(function (val) {
            if (val === undefined) {
                return;
            }
            result.push(arrayStringifier(key, val, result.length));
        });
        return result.join('&');
    }
    return `${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(key)}=${(0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.encodeURIComponent)(value)}`;
})
    .filter(isNotEmpty)
    .join('&') : '';
/*
export class XToQueryString extends DelegatingTransformer<JSONValue,string> {
    constructor( readonly f: Function, xf: Transformer<JSONValue, string> ){
        super( xf );
    }

    [ '@@transducer/step' ]( result: JSONValue, input: string ): JSONValue | Reduced<JSONValue> {
        if( typeof this.f === 'function' ){
            return toQueryString( input );
        }
        return super[ '@@transducer/step' ]( result, input );
    }
}

export const xToQueryString: CurriedFunction2<Function, Transformer<JSONValue, string>, XToQueryString> = curry( ( f, xf ) => new XToQueryString( f, xf ) );

export const qs = curry( ( f: Function, xf: Transformer<JSONValue, string> ) => xToQueryString( f, xf ) );

//export default curry( toQueryString ) as CurriedFunction2<( key: string, value: string, index?: number ) => string, JSONValue, string>;
*/
class QueryString {
    parse(value) {
        return _parsers_query_expression__WEBPACK_IMPORTED_MODULE_1__["default"].run(value).result;
    }
    stringify(value) {
        return toQueryString(value);
    }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (new QueryString());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktc3RyaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3F1ZXJ5LXN0cmluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxPQUFPLGVBQWUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFL0Usc0ZBQXNGO0FBRXRGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUErREU7QUFFRixNQUNJLFVBQVUsR0FBRyxVQUFVLENBQUUsT0FBTyxDQUFFLEVBRWxDLGdCQUFnQixHQUFHLENBQUUsR0FBVyxFQUFFLEtBQWEsRUFBRSxLQUFjLEVBQVcsRUFBRSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBQyxDQUFDLENBQUMsR0FBSSxNQUFNLENBQUUsR0FBRyxDQUFHLElBQUssTUFBTSxDQUFFLEtBQUssQ0FBRyxFQUFFLEVBRXZKLGFBQWEsR0FBRyxDQUFFLE1BQU0sRUFBVyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNO0tBQ2hELElBQUksQ0FBRSxNQUFNLENBQUU7S0FDZCxJQUFJLEVBQUU7S0FDTixHQUFHLENBQUUsVUFBVSxHQUFXO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBQztJQUU1QixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7UUFDckIsT0FBTyxFQUFFLENBQUM7S0FDYjtJQUVELElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtRQUNoQixPQUFPLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBQztLQUN4QjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsRUFBRTtRQUN4QixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFFNUIsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLE9BQU8sQ0FBRSxVQUFVLEdBQVc7WUFDeEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO2dCQUNuQixPQUFPO2FBQ1Y7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFFLGdCQUFnQixDQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBRSxDQUFFLENBQUM7UUFDL0QsQ0FBQyxDQUFFLENBQUM7UUFFSixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUUsR0FBRyxDQUFFLENBQUM7S0FDN0I7SUFFRCxPQUFPLEdBQUksTUFBTSxDQUFFLEdBQUcsQ0FBRyxJQUFLLE1BQU0sQ0FBRSxLQUFLLENBQUcsRUFBRSxDQUFDO0FBQ3JELENBQUMsQ0FBRTtLQUNGLE1BQU0sQ0FBRSxVQUFVLENBQUU7S0FDcEIsSUFBSSxDQUFFLEdBQUcsQ0FBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFMUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFtQkU7QUFFRixNQUFNLFdBQVc7SUFDYixLQUFLLENBQUUsS0FBYTtRQUNoQixPQUFPLGVBQWUsQ0FBQyxHQUFHLENBQUUsS0FBSyxDQUFFLENBQUMsTUFBTSxDQUFDO0lBQy9DLENBQUM7SUFDRCxTQUFTLENBQUUsS0FBVTtRQUNqQixPQUFPLGFBQWEsQ0FBRSxLQUFLLENBQUUsQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUFFRCxlQUFlLElBQUksV0FBVyxFQUFFLENBQUMifQ==

/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "queryExpression": () => (/* binding */ queryExpression)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_parser__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */


const replacePlusWithSpace = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.replace)(/\+/g, ' '),
// Removes '=' from the value array
// e.g. [ "foo", [ "=", "bar" ] ] -> [ "foo", "bar" ]
filterEquals = ([key, value]) => [key, Array.isArray(value) ? value[1] : value], ampersand = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.char)('&'), equals = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.char)('='), prefix = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.choice)([ampersand, (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.char)('?'), (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.char)('#')]), queryKey = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.regex)(/^[A-Za-z+:/?[\]0-9%]+/).map(replacePlusWithSpace).map(_blue_util__WEBPACK_IMPORTED_MODULE_0__.decodeURIComponent), queryValue = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.regex)(/^[A-Za-z+:/?[\]0-9%=]+/).map(replacePlusWithSpace).map(_blue_util__WEBPACK_IMPORTED_MODULE_0__.decodeURIComponent), separatedByAmpersand = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.sepByN)(0)(ampersand), queryParameter = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.sequenceOf)([
    queryKey,
    (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.sequenceOf)([(0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.possibly)(equals), (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.possibly)(queryValue)])
]).map(filterEquals), queryParameterList = separatedByAmpersand(queryParameter);
const queryExpression = (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.coroutine)(function* () {
    yield (0,_blue_parser__WEBPACK_IMPORTED_MODULE_1__.possibly)(prefix);
    const pairs = yield queryParameterList;
    return (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.fromRepeatedPairs)(pairs);
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (queryExpression);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktZXhwcmVzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9wYXJzZXJzL3F1ZXJ5LWV4cHJlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBQ0gsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxrQkFBa0IsSUFBSSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdEYsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUU1RixNQUNJLG9CQUFvQixHQUFHLE9BQU8sQ0FBRSxLQUFLLEVBQUUsR0FBRyxDQUFFO0FBRTVDLG1DQUFtQztBQUNuQyxxREFBcUQ7QUFDckQsWUFBWSxHQUFHLENBQUUsQ0FBRSxHQUFHLEVBQUUsS0FBSyxDQUFFLEVBQUcsRUFBRSxDQUFDLENBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFFLEVBRXpGLFNBQVMsR0FBRyxJQUFJLENBQUUsR0FBRyxDQUFFLEVBQ3ZCLE1BQU0sR0FBRyxJQUFJLENBQUUsR0FBRyxDQUFFLEVBQ3BCLE1BQU0sR0FBRyxNQUFNLENBQUUsQ0FBRSxTQUFTLEVBQUUsSUFBSSxDQUFFLEdBQUcsQ0FBRSxFQUFFLElBQUksQ0FBRSxHQUFHLENBQUUsQ0FBRSxDQUFFLEVBRTFELFFBQVEsR0FBRyxLQUFLLENBQUUsdUJBQXVCLENBQUUsQ0FBQyxHQUFHLENBQUUsb0JBQW9CLENBQUUsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLEVBQ3JGLFVBQVUsR0FBRyxLQUFLLENBQUUsd0JBQXdCLENBQUUsQ0FBQyxHQUFHLENBQUUsb0JBQW9CLENBQUUsQ0FBQyxHQUFHLENBQUUsTUFBTSxDQUFFLEVBRXhGLG9CQUFvQixHQUFHLE1BQU0sQ0FBRSxDQUFDLENBQUUsQ0FBRSxTQUFTLENBQUUsRUFDL0MsY0FBYyxHQUFHLFVBQVUsQ0FBRTtJQUN6QixRQUFRO0lBQ1IsVUFBVSxDQUFFLENBQUUsUUFBUSxDQUFFLE1BQU0sQ0FBRSxFQUFFLFFBQVEsQ0FBRSxVQUFVLENBQUUsQ0FBRSxDQUFFO0NBQy9ELENBQUUsQ0FBQyxHQUFHLENBQUUsWUFBWSxDQUFFLEVBQ3ZCLGtCQUFrQixHQUFHLG9CQUFvQixDQUFFLGNBQWMsQ0FBRSxDQUFDO0FBRWhFLE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUUsUUFBUSxDQUFDO0lBQy9DLE1BQU0sUUFBUSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0lBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sa0JBQWtCLENBQUM7SUFDdkMsT0FBTyxpQkFBaUIsQ0FBRSxLQUFLLENBQUUsQ0FBQztBQUN0QyxDQUFDLENBQUUsQ0FBQztBQUVKLGVBQWUsZUFBZSxDQUFDIn0=

/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__17__;

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ResponseTypeInterceptor": () => (/* binding */ ResponseTypeInterceptor)
/* harmony export */ });
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _http_headers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(13);
/* harmony import */ var _response_error__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(4);
/**
 * @author Jeff Rose
 */




/**
 * @typedef {module:http.HTTPInit} module:http.ResponseTypeInit
 * @property {external:string | module:core.MediaType | external:boolean} [responseType]
 */
const { defineProperty } = Reflect, domParser = new DOMParser(), defaultParsers = new Map(), binaryParser = (mediaType) => async (response) => new Blob([await response.arrayBuffer()], { type: mediaType }), jsonParser = (mediaType) => async (response) => await response.json(), textParser = (mediaType) => async (response) => await response.text(), markupParser = (mediaType) => async (response) => domParser.parseFromString(await response.text(), mediaType), isBoolean = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(Boolean), isMediaType = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.is)(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaType), getMediaType = (0,_blue_util__WEBPACK_IMPORTED_MODULE_1__.cond)([
    [_blue_util__WEBPACK_IMPORTED_MODULE_1__.isString, _blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaType["for"]],
    [isMediaType, _blue_util__WEBPACK_IMPORTED_MODULE_1__.identity],
    [_blue_util__WEBPACK_IMPORTED_MODULE_1__.T, () => null]
]), getParser = (mediaType, parsers = defaultParsers) => {
    const type = mediaType;
    return parsers.has(type) ?
        parsers.get(type)(type.toString()) :
        null;
};
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.APPLICATION_JSON, jsonParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.APPLICATION_PDF, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.APPLICATION_XML, markupParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_BMP, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_GIF, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_JPEG, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_PNG, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_SVG_XML, markupParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_TIFF, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_X_ICON, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.IMAGE_WEBP, binaryParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_HTML, markupParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_JSON, jsonParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_PLAIN, textParser);
defaultParsers.set(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_XML, markupParser);
/**
 * @class module:http.ResponseTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
class ResponseTypeInterceptor {
    /**
     * @function module:http.ResponseTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ResponseTypeInit} settings The HTTP request settings, including the `responseType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        let parsers;
        if ('responseType' in settings) {
            const { responseType } = settings;
            if (!isBoolean(responseType)) {
                const mediaType = getMediaType(responseType);
                if (!mediaType) {
                    throw new TypeError(`Invalid responseType ${responseType}`);
                }
                settings.responseType = mediaType;
            }
        }
        if ('responseParsers' in settings) {
            const { responseParsers } = settings;
            parsers = new Map([...defaultParsers]);
            for (const [type, parser] of (0,_blue_core__WEBPACK_IMPORTED_MODULE_0__.entriesIterator)(responseParsers)) {
                parsers.set(getMediaType(type), parser);
            }
        }
        else {
            parsers = defaultParsers;
        }
        settings.responseParsers = parsers;
        return true;
    }
    /**
     * @async
     * @function module:http.ResponseTypeInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.ResponseTypeSettings} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        if ('responseType' in settings) {
            const { responseType, responseParsers } = settings;
            let mediaType, parser;
            if (!isBoolean(responseType)) {
                mediaType = getMediaType(responseType);
                parser = getParser(mediaType, responseParsers);
            }
            if (!parser && 'headers' in response) {
                const contentType = _http_headers__WEBPACK_IMPORTED_MODULE_2__.CONTENT_TYPE.get(response.headers) || '';
                mediaType = getMediaType(contentType);
                parser = getParser(mediaType, responseParsers);
            }
            if (!parser) {
                parser = getParser(_blue_core__WEBPACK_IMPORTED_MODULE_0__.MediaTypes.TEXT_PLAIN, responseParsers);
            }
            try {
                const data = await parser(response);
                defineProperty(response, 'data', {
                    value: data,
                    configurable: true,
                    enumerable: true,
                    writable: false
                });
            }
            catch (e) {
                throw new _response_error__WEBPACK_IMPORTED_MODULE_3__["default"](response, e);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtdHlwZS1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnRlcmNlcHRvcnMvcmVzcG9uc2UtdHlwZS1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsZUFBZSxFQUFjLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDaEYsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFN0QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sYUFBYSxNQUFNLG1CQUFtQixDQUFDO0FBWTlDOzs7R0FHRztBQUVILE1BQ0ksRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBRTVCLFNBQVMsR0FBRyxJQUFJLFNBQVMsRUFBRSxFQUUzQixjQUFjLEdBQUcsSUFBSSxHQUFHLEVBQTZCLEVBQ3JELFlBQVksR0FBZ0MsQ0FBRSxTQUFpQixFQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUcsUUFBa0IsRUFBRyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUUsQ0FBRSxNQUFNLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFFLEVBQ3RLLFVBQVUsR0FBa0MsQ0FBRSxTQUFpQixFQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUcsUUFBa0IsRUFBRyxFQUFFLENBQUMsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQzFILFVBQVUsR0FBa0MsQ0FBRSxTQUFpQixFQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUcsUUFBa0IsRUFBRyxFQUFFLENBQUMsTUFBTSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQzFILFlBQVksR0FBZ0MsQ0FBRSxTQUFpQixFQUFHLEVBQUUsQ0FBQyxLQUFLLEVB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

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "IfModifiedInterceptor": () => (/* binding */ IfModifiedInterceptor)
/* harmony export */ });
/* harmony import */ var _http_headers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(13);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _IfModifiedInterceptor_eTag, _IfModifiedInterceptor_lastModified;

/**
 * @typedef {module:http.HTTPInit} module:http.IfModifiedInit
 * @property {external:boolean} [ifModified]
 */
/**
 * @class module:http.IfModifiedInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
class IfModifiedInterceptor {
    constructor() {
        _IfModifiedInterceptor_eTag.set(this, void 0);
        _IfModifiedInterceptor_lastModified.set(this, void 0);
        __classPrivateFieldSet(this, _IfModifiedInterceptor_eTag, new Map(), "f");
        __classPrivateFieldSet(this, _IfModifiedInterceptor_lastModified, new Map(), "f");
    }
    /**
     * @function module:http.IfModifiedInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        var _a;
        if (settings.ifModified) {
            const headers = new Headers((_a = settings.headers) !== null && _a !== void 0 ? _a : {}), fullURL = url.toString();
            __classPrivateFieldGet(this, _IfModifiedInterceptor_lastModified, "f").has(fullURL) && _http_headers__WEBPACK_IMPORTED_MODULE_0__.IF_MODIFIED_SINCE.set(headers, __classPrivateFieldGet(this, _IfModifiedInterceptor_lastModified, "f").get(fullURL));
            __classPrivateFieldGet(this, _IfModifiedInterceptor_eTag, "f").has(fullURL) && _http_headers__WEBPACK_IMPORTED_MODULE_0__.IF_NONE_MATCH.set(headers, __classPrivateFieldGet(this, _IfModifiedInterceptor_eTag, "f").get(fullURL));
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
    async postResponse({ headers, url }, settings) {
        if (settings.ifModified) {
            _http_headers__WEBPACK_IMPORTED_MODULE_0__.LAST_MODIFIED.has(headers) && __classPrivateFieldGet(this, _IfModifiedInterceptor_lastModified, "f").set(url, _http_headers__WEBPACK_IMPORTED_MODULE_0__.LAST_MODIFIED.get(headers));
            _http_headers__WEBPACK_IMPORTED_MODULE_0__.ETAG.has(headers) && __classPrivateFieldGet(this, _IfModifiedInterceptor_eTag, "f").set(url, _http_headers__WEBPACK_IMPORTED_MODULE_0__.ETAG.get(headers));
        }
    }
}
_IfModifiedInterceptor_eTag = new WeakMap(), _IfModifiedInterceptor_lastModified = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWYtbW9kaWZpZWQtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW50ZXJjZXB0b3JzL2lmLW1vZGlmaWVkLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7OztBQUdILE9BQU8sRUFBRSxJQUFJLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBSXhGOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8scUJBQXFCO0lBSTlCO1FBSEEsOENBQTJCO1FBQzNCLHNEQUFtQztRQUcvQix1QkFBQSxJQUFJLCtCQUFTLElBQUksR0FBRyxFQUFrQixNQUFBLENBQUM7UUFDdkMsdUJBQUEsSUFBSSx1Q0FBaUIsSUFBSSxHQUFHLEVBQWtCLE1BQUEsQ0FBQztJQUNuRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUUsR0FBUSxFQUFFLFFBQXdCOztRQUN2QyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDckIsTUFDSSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUUsTUFBQSxRQUFRLENBQUMsT0FBTyxtQ0FBSSxFQUFFLENBQUUsRUFDL0MsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3Qix1QkFBQSxJQUFJLDJDQUFjLENBQUMsR0FBRyxDQUFFLE9BQU8sQ0FBRSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBRSxPQUFPLEVBQUUsdUJBQUEsSUFBSSwyQ0FBYyxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDO1lBQ3pHLHVCQUFBLElBQUksbUNBQU0sQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBRSxPQUFPLEVBQUUsdUJBQUEsSUFBSSxtQ0FBTSxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDO1lBQ3JGLFFBQVEsQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFZLEVBQUUsUUFBd0I7UUFDcEUsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO1lBQ3JCLGFBQWEsQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLElBQUksdUJBQUEsSUFBSSwyQ0FBYyxDQUFDLEdBQUcsQ0FBRSxHQUFHLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDO1lBQzVGLElBQUksQ0FBQyxHQUFHLENBQUUsT0FBTyxDQUFFLElBQUksdUJBQUEsSUFBSSxtQ0FBTSxDQUFDLEdBQUcsQ0FBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDO1NBQ3JFO0lBQ0wsQ0FBQztDQUNKIn0=

/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "NotOKInterceptor": () => (/* binding */ NotOKInterceptor)
/* harmony export */ });
/* harmony import */ var _response_error__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(4);
/**
 * @author Jeff Rose
 */

/**
 * @class module:http.NotOKInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
class NotOKInterceptor {
    /**
     * @async
     * @function module:http.NotOKInterceptor#postResponse
     * @param {external:Response} response The HTTP response
     * @param {module:http.HTTPInit} settings The HTTP request settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response, settings) {
        if (!response.ok) {
            throw new _response_error__WEBPACK_IMPORTED_MODULE_0__["default"](response, 'Status Code is not 200-299');
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90LW9rLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2ludGVyY2VwdG9ycy9ub3Qtb2staW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBR0gsT0FBTyxhQUFhLE1BQU0sbUJBQW1CLENBQUM7QUFFOUM7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGdCQUFnQjtJQUN6Qjs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsWUFBWSxDQUFFLFFBQWtCLEVBQUUsUUFBa0I7UUFDdEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUU7WUFDZCxNQUFNLElBQUksYUFBYSxDQUFFLFFBQVEsRUFBRSw0QkFBNEIsQ0FBRSxDQUFDO1NBQ3JFO0lBQ0wsQ0FBQztDQUNKIn0=

/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "TimeoutInterceptor": () => (/* binding */ TimeoutInterceptor)
/* harmony export */ });
/* harmony import */ var _response_error__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _response_statuses__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TimeoutInterceptor_timeoutId;



const { defineProperty } = Reflect, { isInteger } = Number, greaterThanZero = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.gt)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.__, 0), isPositiveNumber = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.allPass)([_blue_util__WEBPACK_IMPORTED_MODULE_0__.isNumber, isInteger, greaterThanZero]);
/**
 * @class module:http.TimeoutInterceptor
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
class TimeoutInterceptor {
    constructor(timeout) {
        _TimeoutInterceptor_timeoutId.set(this, void 0);
        if (!isPositiveNumber(timeout)) {
            throw new TypeError(`timeout must be a positive integer`);
        }
        /**
         * @readonly
         * @member {external:number} module:http.TimeoutInterceptor#timeout
         */
        defineProperty(this, 'timeout', {
            get: () => timeout,
            configurable: true,
            enumerable: true
        });
        __classPrivateFieldSet(this, _TimeoutInterceptor_timeoutId, null, "f");
    }
    /**
     * @function module:http.TimeoutInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        const controller = new AbortController(), fetchTimeout = () => controller.abort();
        settings.signal = controller.signal;
        settings.timeout = isPositiveNumber(settings.timeout) ?
            settings.timeout :
            this.timeout;
        // @ts-ignore: TypeScript is confusing Web setTimeout with Node setTimeout -JBR
        __classPrivateFieldSet(this, _TimeoutInterceptor_timeoutId, setTimeout(fetchTimeout, settings.timeout), "f");
        return true;
    }
    /**
     * @async
     * @function module:http.TimeoutInterceptor#postError
     * @param {external:Error} error The error that was thrown
     * @param {external:Request} request The HTTP request
     * @returns {exteral:Promise<external:Response | external:undefined>}
     */
    async postError(error, request) {
        if (error.name === 'AbortError') {
            this._clearTimeout();
        }
        return new _response_error__WEBPACK_IMPORTED_MODULE_1__["default"](_response_statuses__WEBPACK_IMPORTED_MODULE_2__.REQUEST_TIMEOUT.createResponse(null), error);
    }
    /**
     * @function module:http.TimeoutInterceptor#postComplete
     * @param {external:Request} request The HTTP request
     * @param {external:Response} response The HTTP response
     */
    postComplete(request, response) {
        if (__classPrivateFieldGet(this, _TimeoutInterceptor_timeoutId, "f") !== null) {
            this._clearTimeout();
        }
    }
    _clearTimeout() {
        clearTimeout(__classPrivateFieldGet(this, _TimeoutInterceptor_timeoutId, "f"));
        __classPrivateFieldSet(this, _TimeoutInterceptor_timeoutId, null, "f");
    }
}
_TimeoutInterceptor_timeoutId = new WeakMap();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC1pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnRlcmNlcHRvcnMvdGltZW91dC1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7QUFFSCxPQUFPLGFBQWEsTUFBTSxtQkFBbUIsQ0FBQztBQUM5QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXZELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUl2RCxNQUNJLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixFQUFFLFNBQVMsRUFBRSxHQUFHLE1BQU0sRUFDdEIsZUFBZSxHQUFHLEVBQUUsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQzdCLGdCQUFnQixHQUFHLE9BQU8sQ0FBRSxDQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsZUFBZSxDQUFFLENBQUUsQ0FBQztBQUUzRTs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7SUFLM0IsWUFBYSxPQUFlO1FBSjVCLGdEQUFtQjtRQUtmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBRSxPQUFPLENBQUUsRUFBRTtZQUM5QixNQUFNLElBQUksU0FBUyxDQUFFLG9DQUFvQyxDQUFFLENBQUM7U0FDL0Q7UUFFRDs7O1dBR0c7UUFDSCxjQUFjLENBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUM3QixHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTztZQUNsQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFFLENBQUM7UUFFSix1QkFBQSxJQUFJLGlDQUFjLElBQUksTUFBQSxDQUFDO0lBQzNCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBRSxHQUFRLEVBQUUsUUFBcUI7UUFDcEMsTUFDSSxVQUFVLEdBQUcsSUFBSSxlQUFlLEVBQUUsRUFDbEMsWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUU1QyxRQUFRLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDcEMsUUFBUSxDQUFDLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBRSxRQUFRLENBQUMsT0FBTyxDQUFFLENBQUMsQ0FBQztZQUNyRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUVqQiwrRUFBK0U7UUFDL0UsdUJBQUEsSUFBSSxpQ0FBYyxVQUFVLENBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUUsTUFBQSxDQUFDO1FBQy9ELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsU0FBUyxDQUFFLEtBQVksRUFBRSxPQUFnQjtRQUMzQyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssWUFBWSxFQUFFO1lBQzdCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN4QjtRQUNELE9BQU8sSUFBSSxhQUFhLENBQUUsZUFBZSxDQUFDLGNBQWMsQ0FBRSxJQUFJLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztJQUM5RSxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFlBQVksQ0FBRSxPQUFnQixFQUFFLFFBQWtCO1FBQzlDLElBQUksdUJBQUEsSUFBSSxxQ0FBVyxLQUFLLElBQUksRUFBRTtZQUMxQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRU8sYUFBYTtRQUNqQixZQUFZLENBQUUsdUJBQUEsSUFBSSxxQ0FBVyxDQUFFLENBQUM7UUFDaEMsdUJBQUEsSUFBSSxpQ0FBYyxJQUFJLE1BQUEsQ0FBQztJQUMzQixDQUFDO0NBQ0oifQ==

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ContentTypeInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.ContentTypeInterceptor),
/* harmony export */   "DataParameterInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.DataParameterInterceptor),
/* harmony export */   "HTTP": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.HTTP),
/* harmony export */   "HTTPExecutionChain": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.HTTPExecutionChain),
/* harmony export */   "HTTPHeader": () => (/* reexport safe */ _http_header__WEBPACK_IMPORTED_MODULE_1__.HTTPHeader),
/* harmony export */   "HTTPHeaders": () => (/* reexport module object */ _http_headers__WEBPACK_IMPORTED_MODULE_3__),
/* harmony export */   "IfModifiedInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.IfModifiedInterceptor),
/* harmony export */   "MappedHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.MappedHTTPInterceptor),
/* harmony export */   "MappedResponseClassHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.MappedResponseClassHTTPInterceptor),
/* harmony export */   "MappedResponseCodeHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.MappedResponseCodeHTTPInterceptor),
/* harmony export */   "NotOKInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.NotOKInterceptor),
/* harmony export */   "ResponseStatuses": () => (/* reexport module object */ _response_statuses__WEBPACK_IMPORTED_MODULE_4__),
/* harmony export */   "ResponseTypeInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.ResponseTypeInterceptor),
/* harmony export */   "TimeoutInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.TimeoutInterceptor),
/* harmony export */   "WildcardMatcher": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.WildcardMatcher),
/* harmony export */   "assign": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.assign),
/* harmony export */   "defaults": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.defaults),
/* harmony export */   "defineProperty": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.defineProperty),
/* harmony export */   "freeze": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.freeze),
/* harmony export */   "isRequest": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.isRequest),
/* harmony export */   "likeClientErrorAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.likeClientErrorAwareHTTPInterceptor),
/* harmony export */   "likeCompletionAwareHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.likeCompletionAwareHTTPInterceptor),
/* harmony export */   "likeErrorAwareHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.likeErrorAwareHTTPInterceptor),
/* harmony export */   "likeHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.likeHTTPInterceptor),
/* harmony export */   "likeInformationAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.likeInformationAwareHTTPInterceptor),
/* harmony export */   "likeInitializationAwareHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.likeInitializationAwareHTTPInterceptor),
/* harmony export */   "likeRedirectAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.likeRedirectAwareHTTPInterceptor),
/* harmony export */   "likeRequestAwareHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.likeRequestAwareHTTPInterceptor),
/* harmony export */   "likeResponseAwareHTTPInterceptor": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.likeResponseAwareHTTPInterceptor),
/* harmony export */   "likeServerErrorAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.likeServerErrorAwareHTTPInterceptor),
/* harmony export */   "likeSuccessAwareHTTPInterceptor": () => (/* reexport safe */ _interceptors__WEBPACK_IMPORTED_MODULE_2__.likeSuccessAwareHTTPInterceptor),
/* harmony export */   "patternCache": () => (/* reexport safe */ _http__WEBPACK_IMPORTED_MODULE_0__.patternCache)
/* harmony export */ });
/* harmony import */ var _http_headers__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);
/* harmony import */ var _response_statuses__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _http_header__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony import */ var _interceptors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/**
 * @author Jeff Rose
 * @module http
 * @requires core
 * @requires parser
 * @requires util
 */
/**
 * @external fetch
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch}
 */
/**
 * @external Body
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Body}
 */
/**
 * @external BodyInit
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#Parameters}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Blob}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/BufferSource}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/FormData}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
 */
/**
 * @external Headers
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Headers}
 */
/**
 * @external HeadersInit
 */
/**
 * @external Request
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request}
 */
/**
 * @external RequestInfo
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#Parameters}
 */
/**
 * @external RequestInit
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Request/Request#Parameters}
 */
/**
 * @external Response
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response}
 */
/**
 * @external ResponseInit
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Response/Response#Parameters}
 */








//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7R0FPRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7Ozs7Ozs7R0FTRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUgsT0FBTyxLQUFLLFdBQVcsTUFBTSxnQkFBZ0IsQ0FBQztBQUM5QyxPQUFPLEtBQUssZ0JBQWdCLE1BQU0scUJBQXFCLENBQUM7QUFFeEQsY0FBYyxRQUFRLENBQUM7QUFDdkIsY0FBYyxlQUFlLENBQUM7QUFDOUIsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLG1CQUFtQixDQUFDO0FBQ2xDLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQztBQUN2QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyJ9
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
