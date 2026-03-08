/**
 * @author Jeff Rose
 */

import { JSONObject } from '@blue/core';
import { like } from '@blue/util/types';
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
export const likeInformationAwareHTTPInterceptor = like({ postInformationalResponse: Function }) as (
    value
) => value is InformationAwareHTTPInterceptor;

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link SuccessAwareHTTPInterceptor}.
 */
export const likeSuccessAwareHTTPInterceptor = like({ postSuccessfulResponse: Function }) as (
    value
) => value is SuccessAwareHTTPInterceptor;

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link RedirectAwareHTTPInterceptor}.
 */
export const likeRedirectAwareHTTPInterceptor = like({ postRedirectResponse: Function }) as (
    value
) => value is RedirectAwareHTTPInterceptor;

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link ClientErrorAwareHTTPInterceptor}.
 */
export const likeClientErrorAwareHTTPInterceptor = like({ postClientErrorResponse: Function }) as (
    value
) => value is ClientErrorAwareHTTPInterceptor;

/**
 * @param {*} value
 * @returns {boolean} Whether or not a value is like {@link ServerErrorAwareHTTPInterceptor}.
 */
export const likeServerErrorAwareHTTPInterceptor = like({ postServerErrorResponse: Function }) as (
    value
) => value is ServerErrorAwareHTTPInterceptor;

/**
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
     * @param {Response} response
     * @param {module:http.HTTPInit} settings
     * @returns {Promise<external:void>}
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
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
