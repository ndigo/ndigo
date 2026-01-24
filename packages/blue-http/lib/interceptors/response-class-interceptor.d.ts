/**
 * @author Jeff Rose
 */
import { JSONObject } from '@blue/core';
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status}
 */
export interface InformationAwareHTTPInterceptor {
    postInformationalResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}
export interface SuccessAwareHTTPInterceptor {
    postSuccessfulResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}
export interface RedirectAwareHTTPInterceptor {
    postRedirectResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}
export interface ClientErrorAwareHTTPInterceptor {
    postClientErrorResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}
export interface ServerErrorAwareHTTPInterceptor {
    postServerErrorResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}
export type ResponseClassAwareHTTPInterceptor = InformationAwareHTTPInterceptor | SuccessAwareHTTPInterceptor | RedirectAwareHTTPInterceptor | ClientErrorAwareHTTPInterceptor | ServerErrorAwareHTTPInterceptor;
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
export declare const likeInformationAwareHTTPInterceptor: (value: any) => value is InformationAwareHTTPInterceptor;
/**
 * @function module:http.likeSuccessAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.SuccessAwareHTTPInterceptor}.
 */
export declare const likeSuccessAwareHTTPInterceptor: (value: any) => value is SuccessAwareHTTPInterceptor;
/**
 * @function module:http.likeRedirectAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.RedirectAwareHTTPInterceptor}.
 */
export declare const likeRedirectAwareHTTPInterceptor: (value: any) => value is RedirectAwareHTTPInterceptor;
/**
 * @function module:http.likeClientErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ClientErrorAwareHTTPInterceptor}.
 */
export declare const likeClientErrorAwareHTTPInterceptor: (value: any) => value is ClientErrorAwareHTTPInterceptor;
/**
 * @function module:http.likeServerErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ServerErrorAwareHTTPInterceptor}.
 */
export declare const likeServerErrorAwareHTTPInterceptor: (value: any) => value is ServerErrorAwareHTTPInterceptor;
/**
 * @class module:http.MappedResponseClassHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseClassAwareHTTPInterceptor} interceptor
 */
export declare class MappedResponseClassHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #private;
    /**
     * @readonly
     * @member {module:http.ResponseClassAwareHTTPInterceptor} module:http.MappedResponseClassHTTPInterceptor#interceptor
     */
    get interceptor(): ResponseClassAwareHTTPInterceptor;
    constructor(interceptor: any);
    /**
     * @async
     * @function module:http.MappedResponseClassHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
}
//# sourceMappingURL=response-class-interceptor.d.ts.map