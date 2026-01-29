/**
 * @author Jeff Rose
 */

import ResponseError from '../response-error';
import { __ } from '@blue/util/function';
import { allPass } from '@blue/util/logic';
import { gt } from '@blue/util/relation';
import { isNumber } from '@blue/util/types';
import {
    CompletionAwareHTTPInterceptor,
    ErrorAwareHTTPInterceptor,
    HTTPInit,
    InitializationAwareHTTPInterceptor,
} from '../http';
import { REQUEST_TIMEOUT } from '../response-statuses';

export type TimeoutInit = HTTPInit & { timeout?: number };

const { defineProperty } = Reflect,
    { isInteger } = Number,
    greaterThanZero = gt(__, 0),
    isPositiveNumber = allPass([isNumber, isInteger, greaterThanZero]);

/**
 * @implements module:http.CompletionAwareHTTPInterceptor
 * @implements module:http.ErrorAwareHTTPInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class TimeoutInterceptor
    implements
        InitializationAwareHTTPInterceptor<TimeoutInit>,
        ErrorAwareHTTPInterceptor,
        CompletionAwareHTTPInterceptor
{
    #timeoutId: number;

    readonly timeout: number;

    constructor(timeout: number) {
        if (!isPositiveNumber(timeout)) {
            throw new TypeError(`timeout must be a positive integer`);
        }

        /**
         * @readonly
         */
        defineProperty(this, 'timeout', {
            get: () => timeout,
            configurable: true,
            enumerable: true,
        });

        this.#timeoutId = null;
    }

    /**
     * @param {URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: TimeoutInit): boolean {
        const controller = new AbortController(),
            fetchTimeout = () => controller.abort();

        settings.signal = controller.signal;
        settings.timeout = isPositiveNumber(settings.timeout) ? settings.timeout : this.timeout;

        // @ts-ignore: TypeScript is confusing Web setTimeout with Node setTimeout -JBR
        this.#timeoutId = setTimeout(fetchTimeout, settings.timeout);
        return true;
    }

    /**
     * @async
     * @param {Error} error The error that was thrown
     * @param {Request} request The HTTP request
     * @returns {exteral:Promise<external:Response | external:undefined>}
     */
    async postError(error: Error, request: Request): Promise<Response | undefined> {
        if (error.name === 'AbortError') {
            this._clearTimeout();
        }
        return new ResponseError(REQUEST_TIMEOUT.createResponse(null), error);
    }

    /**
     * @param {Request} request The HTTP request
     * @param {Response} response The HTTP response
     */
    postComplete(request: Request, response: Response): void {
        if (this.#timeoutId !== null) {
            this._clearTimeout();
        }
    }

    private _clearTimeout() {
        clearTimeout(this.#timeoutId);
        this.#timeoutId = null;
    }
}
