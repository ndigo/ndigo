/**
 * @author Jeff Rose
 */

import { JSONObject } from '@blue/core';
import { like } from '@blue/util';
import { HTTPInit, ResponseAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';
import ResponseStatus from '../response-status';

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

export type ResponseClassAwareHTTPInterceptor =
    | InformationAwareHTTPInterceptor
    | SuccessAwareHTTPInterceptor
    | RedirectAwareHTTPInterceptor
    | ClientErrorAwareHTTPInterceptor
    | ServerErrorAwareHTTPInterceptor;

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
export const likeInformationAwareHTTPInterceptor = like({ postInformationalResponse: Function }) as (
    value
) => value is InformationAwareHTTPInterceptor;

/**
 * @function module:http.likeSuccessAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.SuccessAwareHTTPInterceptor}.
 */
export const likeSuccessAwareHTTPInterceptor = like({ postSuccessfulResponse: Function }) as (
    value
) => value is SuccessAwareHTTPInterceptor;

/**
 * @function module:http.likeRedirectAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.RedirectAwareHTTPInterceptor}.
 */
export const likeRedirectAwareHTTPInterceptor = like({ postRedirectResponse: Function }) as (
    value
) => value is RedirectAwareHTTPInterceptor;

/**
 * @function module:http.likeClientErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ClientErrorAwareHTTPInterceptor}.
 */
export const likeClientErrorAwareHTTPInterceptor = like({ postClientErrorResponse: Function }) as (
    value
) => value is ClientErrorAwareHTTPInterceptor;

/**
 * @function module:http.likeServerErrorAwareHTTPInterceptor
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is like {@link module:http.ServerErrorAwareHTTPInterceptor}.
 */
export const likeServerErrorAwareHTTPInterceptor = like({ postServerErrorResponse: Function }) as (
    value
) => value is ServerErrorAwareHTTPInterceptor;

/**
 * @class module:http.MappedResponseClassHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 * @param {module:http.ResponseClassAwareHTTPInterceptor} interceptor
 */
export class MappedResponseClassHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #interceptor: ResponseClassAwareHTTPInterceptor;
    #hasInformationAwareInterceptor: boolean;
    #hasSuccessAwareInterceptor: boolean;
    #hasRedirectAwareInterceptor: boolean;
    #hasClientErrorAwareInterceptor: boolean;
    #hasServerErrorAwareInterceptor: boolean;

    /**
     * @readonly
     * @member {module:http.ResponseClassAwareHTTPInterceptor} module:http.MappedResponseClassHTTPInterceptor#interceptor
     */
    get interceptor() {
        return this.#interceptor;
    }

    constructor(interceptor) {
        this.#interceptor = interceptor;
        this.#hasInformationAwareInterceptor = likeInformationAwareHTTPInterceptor(interceptor);
        this.#hasSuccessAwareInterceptor = likeSuccessAwareHTTPInterceptor(interceptor);
        this.#hasRedirectAwareInterceptor = likeRedirectAwareHTTPInterceptor(interceptor);
        this.#hasClientErrorAwareInterceptor = likeClientErrorAwareHTTPInterceptor(interceptor);
        this.#hasServerErrorAwareInterceptor = likeServerErrorAwareHTTPInterceptor(interceptor);
    }

    /**
     * @async
     * @function module:http.MappedResponseClassHTTPInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<void> {
        if (response.ok && this.#hasSuccessAwareInterceptor) {
            await (this.#interceptor as SuccessAwareHTTPInterceptor).postSuccessfulResponse(response, settings);
        } else {
            const status = ResponseStatus.for(response);
            if (status.isInformationClass && this.#hasInformationAwareInterceptor) {
                await (this.#interceptor as InformationAwareHTTPInterceptor).postInformationalResponse(
                    response,
                    settings
                );
            } else if (status.isRedirectClass && this.#hasRedirectAwareInterceptor) {
                await (this.#interceptor as RedirectAwareHTTPInterceptor).postRedirectResponse(response, settings);
            } else if (status.isClientErrorClass && this.#hasClientErrorAwareInterceptor) {
                await (this.#interceptor as ClientErrorAwareHTTPInterceptor).postClientErrorResponse(
                    response,
                    settings
                );
            } else if (status.isServerErrorClass && this.#hasServerErrorAwareInterceptor) {
                await (this.#interceptor as ServerErrorAwareHTTPInterceptor).postServerErrorResponse(
                    response,
                    settings
                );
            } else if (response instanceof ResponseError) {
                throw response;
            } else {
                throw new ResponseError(response, `Invalid status code: ${status.code}`);
            }
        }
    }
}
