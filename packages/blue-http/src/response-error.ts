/**
 * @author Jeff Rose
 */

import { FrameworkError } from '@blue/core';
import { IM_A_TEAPOT } from './response-statuses';
import { is } from '@blue/util/types';
import { likeResponse } from './like-response';

const { defineProperty } = Reflect,
    isError = is(Error) as (value) => value is Error;

export class ResponseError extends FrameworkError implements Error, Response {
    #originalError: Error;
    #response: Response;

    declare body: ReadableStream<Uint8Array>;
    declare bodyUsed: boolean;
    declare headers: Headers;
    declare name: string;
    declare message: string;
    declare ok: boolean;
    declare redirected: boolean;
    declare stack?: string;
    declare status: number;
    declare statusText: string;
    declare type: ResponseType;
    declare url: string;

    get [Symbol.toStringTag](): string {
        return 'ResponseError';
    }

    constructor(response?: Response, message?: string);
    constructor(response?: Response, error?: Error);
    constructor(response: Response = null, messageOrError: string | Error = 'Invalid response') {
        super(isError(messageOrError) ? messageOrError.message : messageOrError);
        this.stack = isError(messageOrError) ? messageOrError.stack : '';
        this.name = 'ResponseError';

        this.#originalError = isError(messageOrError) ? messageOrError : null;

        if (!likeResponse(response)) {
            response = IM_A_TEAPOT.createResponse(null);
        }

        this.#response = response;

        defineProperty(this, 'body', {
            get: () => this.#response.body,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'bodyUsed', {
            get: () => this.#response.bodyUsed,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'headers', {
            get: () => this.#response.headers,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'ok', {
            get: () => this.#response.ok,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'redirected', {
            get: () => this.#response.redirected,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'status', {
            get: () => this.#response.status,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'statusText', {
            get: () => this.#response.statusText,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'type', {
            get: () => 'error',
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'url', {
            get: () => this.#response.url,
            configurable: true,
            enumerable: true,
        });
    }

    clone(): Response {
        const error = isError(this.#originalError) ? this.#originalError : new Error(this.message),
            response = this.#response.clone();
        error.stack = this.stack;
        error.name = this.name;
        return new ResponseError(response, error);
    }

    arrayBuffer(): Promise<ArrayBuffer> {
        return this.#response.arrayBuffer();
    }

    blob(): Promise<Blob> {
        return this.#response.blob();
    }

    formData(): Promise<FormData> {
        return this.#response.formData();
    }

    json(): Promise<any> {
        return this.#response.json();
    }

    text(): Promise<string> {
        return this.#response.text();
    }

    bytes(): Promise<Uint8Array> {
        return this.#response.bytes();
    }
}

export default ResponseError;
