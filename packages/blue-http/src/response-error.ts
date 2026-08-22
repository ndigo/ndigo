/**
 * @author Jeff Rose
 */

import { FrameworkError } from '@blue/core';
import { IM_A_TEAPOT } from './response-statuses';
import { is } from '@blue/util/types';
import { likeResponse } from './like-response';

const { defineProperty } = Reflect,
    isError = is(Error) as (value: any) => value is Error;

/**
 * Error wrapper that also exposes the `Response` interface.
 *
 * It preserves the original response when possible so callers can inspect the
 * failed payload without losing fetch semantics.
 */
export class ResponseError extends FrameworkError implements Error, Response {
    #originalError: Error;
    #response: Response;
    /** Cached buffer for multiple body reads (body can only be read once). */
    #bodyBuffer: ArrayBuffer | null = null;

    declare body: ReadableStream<Uint8Array<ArrayBuffer>>;
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

    /**
     * Wraps a response with a message or error.
     *
     * @param response - The response to expose.
     * @param message - The error message to use.
     */
    constructor(response?: Response, message?: string);
    /**
     * Wraps a response with a message or error.
     *
     * @param response - The response to expose.
     * @param error - The original error.
     */
    constructor(response?: Response, error?: Error);
    constructor(response: Response | null = null, messageOrError: string | Error = 'Invalid response') {
        super(isError(messageOrError) ? messageOrError.message : messageOrError);
        this.stack = isError(messageOrError) ? messageOrError.stack : '';

        this.#originalError = isError(messageOrError) ? messageOrError : new Error(messageOrError as string);

        if (!likeResponse(response)) {
            response = IM_A_TEAPOT.createResponse('');
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

    /**
     * Creates a copy of the wrapped response error.
     *
     * @returns A cloned `ResponseError`.
     */
    clone(): Response {
        const error = isError(this.#originalError) ? this.#originalError : new Error(this.message),
            response = this.#response.clone();
        error.stack = this.stack;
        error.name = this.name;
        return new ResponseError(response, error);
    }

    /**
     * Reads the wrapped response as an `ArrayBuffer`.
     *
     * @returns A promise for the response bytes.
     */
    arrayBuffer(): Promise<ArrayBuffer> {
        if (this.#bodyBuffer !== null) return Promise.resolve(this.#bodyBuffer);
        return this.#response.arrayBuffer().then((buf) => {
            this.#bodyBuffer = buf;
            return buf;
        });
    }

    /**
     * Reads the wrapped response as a `Blob`.
     *
     * @returns A promise for the response blob.
     */
    blob(): Promise<Blob> {
        if (this.#bodyBuffer !== null) return Promise.resolve(new Blob([this.#bodyBuffer]));
        return this.#response.blob().then((blob) => {
            return blob.arrayBuffer().then((buf) => {
                this.#bodyBuffer = buf;
                return blob;
            });
        });
    }

    /**
     * Reads the wrapped response as `FormData`.
     *
     * @returns A promise for the response form data.
     */
    formData(): Promise<FormData> {
        return this.#response.formData();
    }

    /**
     * Reads the wrapped response as JSON.
     *
     * @returns A promise for the parsed JSON value.
     */
    json(): Promise<any> {
        if (this.#bodyBuffer !== null) {
            return Promise.resolve(JSON.parse(new TextDecoder().decode(this.#bodyBuffer)));
        }
        return this.#response.json();
    }

    /**
     * Reads the wrapped response as text.
     *
     * @returns A promise for the response text.
     */
    text(): Promise<string> {
        if (this.#bodyBuffer !== null) return Promise.resolve(new TextDecoder().decode(this.#bodyBuffer));
        return this.#response.text().then((text) => {
            this.#bodyBuffer = new TextEncoder().encode(text).buffer;
            return text;
        });
    }

    /**
     * Reads the wrapped response as bytes.
     *
     * @returns A promise for the response bytes.
     */
    bytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this.#bodyBuffer !== null) return Promise.resolve(new Uint8Array(this.#bodyBuffer));
        return this.#response.bytes().then((bytes) => {
            this.#bodyBuffer = bytes.buffer;
            return bytes;
        });
    }
}

export default ResponseError;
