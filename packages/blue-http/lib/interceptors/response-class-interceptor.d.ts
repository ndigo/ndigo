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
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 */
/**
 * @param {exteral:Response} response The http response
 * @param {module:http.HTTPInit} settings The http request settings
 * @returns {Promise<module:core.JSONObject | undefined>}
 */
/**
 * @typedef {module:http.InformationAwareHTTPInterceptor|module:http.SuccessAwareHTTPInterceptor|module:http.RedirectAwareHTTPInterceptor|module:http.ClientErrorAwareHTTPInterceptor|module:http.ServerErrorAwareHTTPInterceptor} module:http.ResponseClassAwareHTTPInterceptor
 */
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link InformationAwareHTTPInterceptor}.
 */
export declare const likeInformationAwareHTTPInterceptor: (value: any) => value is InformationAwareHTTPInterceptor;
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link SuccessAwareHTTPInterceptor}.
 */
export declare const likeSuccessAwareHTTPInterceptor: (value: any) => value is SuccessAwareHTTPInterceptor;
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link RedirectAwareHTTPInterceptor}.
 */
export declare const likeRedirectAwareHTTPInterceptor: (value: any) => value is RedirectAwareHTTPInterceptor;
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link ClientErrorAwareHTTPInterceptor}.
 */
export declare const likeClientErrorAwareHTTPInterceptor: (value: any) => value is ClientErrorAwareHTTPInterceptor;
/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link ServerErrorAwareHTTPInterceptor}.
 */
export declare const likeServerErrorAwareHTTPInterceptor: (value: any) => value is ServerErrorAwareHTTPInterceptor;
/**
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseClassAwareHTTPInterceptor} interceptor
 */
export declare class MappedResponseClassHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #private;
    /**
     * @readonly
     */
    get interceptor(): ResponseClassAwareHTTPInterceptor;
    constructor(interceptor: any);
    /**
     * @async
     * @param {Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {Promise<external:void>}
     */
    postResponse(response: Response, settings: HTTPInit): Promise<void>;
}
//# sourceMappingURL=response-class-interceptor.d.ts.map