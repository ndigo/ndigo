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

/**
 * Handles informational responses.
 */
export interface InformationAwareHTTPInterceptor {
    postInformationalResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}

/**
 * Handles successful responses.
 */
export interface SuccessAwareHTTPInterceptor {
    postSuccessfulResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}

/**
 * Handles redirect responses.
 */
export interface RedirectAwareHTTPInterceptor {
    postRedirectResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}

/**
 * Handles client error responses.
 */
export interface ClientErrorAwareHTTPInterceptor {
    postClientErrorResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}

/**
 * Handles server error responses.
 */
export interface ServerErrorAwareHTTPInterceptor {
    postServerErrorResponse(response: Response, settings: HTTPInit): Promise<JSONObject | void>;
}

/**
 * Union of all response-class-specific interceptor roles.
 */
export type ResponseClassAwareHTTPInterceptor =
    | InformationAwareHTTPInterceptor
    | SuccessAwareHTTPInterceptor
    | RedirectAwareHTTPInterceptor
    | ClientErrorAwareHTTPInterceptor
    | ServerErrorAwareHTTPInterceptor;

/**
 * Tests whether a value exposes `postInformationalResponse()`.
 *
 * @param value - The value to test.
 * @returns `true` when the value is informational-response-aware.
 */
export const likeInformationAwareHTTPInterceptor = like({ postInformationalResponse: Function }) as (
    value: any
) => value is InformationAwareHTTPInterceptor;

/**
 * Tests whether a value exposes `postSuccessfulResponse()`.
 *
 * @param value - The value to test.
 * @returns `true` when the value is success-response-aware.
 */
export const likeSuccessAwareHTTPInterceptor = like({ postSuccessfulResponse: Function }) as (
    value: any
) => value is SuccessAwareHTTPInterceptor;

/**
 * Tests whether a value exposes `postRedirectResponse()`.
 *
 * @param value - The value to test.
 * @returns `true` when the value is redirect-response-aware.
 */
export const likeRedirectAwareHTTPInterceptor = like({ postRedirectResponse: Function }) as (
    value: any
) => value is RedirectAwareHTTPInterceptor;

/**
 * Tests whether a value exposes `postClientErrorResponse()`.
 *
 * @param value - The value to test.
 * @returns `true` when the value is client-error-response-aware.
 */
export const likeClientErrorAwareHTTPInterceptor = like({ postClientErrorResponse: Function }) as (
    value: any
) => value is ClientErrorAwareHTTPInterceptor;

/**
 * Tests whether a value exposes `postServerErrorResponse()`.
 *
 * @param value - The value to test.
 * @returns `true` when the value is server-error-response-aware.
 */
export const likeServerErrorAwareHTTPInterceptor = like({ postServerErrorResponse: Function }) as (
    value: any
) => value is ServerErrorAwareHTTPInterceptor;

/**
 * Dispatches response hooks based on the response status class.
 *
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class MappedResponseClassHTTPInterceptor implements ResponseAwareHTTPInterceptor {
    #interceptor: ResponseClassAwareHTTPInterceptor;
    #hasInformationAwareInterceptor: boolean;
    #hasSuccessAwareInterceptor: boolean;
    #hasRedirectAwareInterceptor: boolean;
    #hasClientErrorAwareInterceptor: boolean;
    #hasServerErrorAwareInterceptor: boolean;

    /**
     * The wrapped interceptor that receives class-specific callbacks.
     */
    get interceptor() {
        return this.#interceptor;
    }

    /**
     * Creates a response-class dispatcher.
     *
     * @param interceptor - The interceptor to wrap.
     */
    constructor(interceptor: any) {
        this.#interceptor = interceptor;
        this.#hasInformationAwareInterceptor = likeInformationAwareHTTPInterceptor(interceptor);
        this.#hasSuccessAwareInterceptor = likeSuccessAwareHTTPInterceptor(interceptor);
        this.#hasRedirectAwareInterceptor = likeRedirectAwareHTTPInterceptor(interceptor);
        this.#hasClientErrorAwareInterceptor = likeClientErrorAwareHTTPInterceptor(interceptor);
        this.#hasServerErrorAwareInterceptor = likeServerErrorAwareHTTPInterceptor(interceptor);
    }

    /**
     * Dispatches the response to the appropriate class-specific hook.
     *
     * @param response - The response to classify.
     * @param settings - The request settings used for the call.
     * @returns A promise that settles after the matching hook completes.
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
