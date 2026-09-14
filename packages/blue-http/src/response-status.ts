/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    Comparable,
    createNull,
    Equatable,
    JSONObject,
    numberComparator,
    Serializable,
    stringComparator,
} from '@blue/core';
import { likeResponse } from './like-response';

const { assign } = Object,
    { defineProperty } = Reflect,
    statuses = new Map<number, ResponseStatus>();

/**
 * Represents an HTTP response status code and reason phrase.
 *
 * Instances are cached by code so repeated lookups return the same object when
 * possible.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes}
 */
export default class ResponseStatus implements Comparable<ResponseStatus>, Equatable, Serializable {
    /**
     * The numeric HTTP status code.
     */
    readonly code!: number;

    /**
     * The reason phrase associated with the status code.
     */
    readonly text!: string;

    /**
     * Returns a cached status for the given response.
     *
     * @param response - The response to inspect.
     * @returns The matching status, or `null` when the response status is unknown.
     */
    static for(response: Response): ResponseStatus;
    /**
     * Returns a cached status for the given code.
     *
     * @param code - The numeric status code.
     * @param text - Optional reason phrase used when creating a new status.
     * @returns The matching or newly created status, or `null` when no text is provided.
     */
    static for(code: number, text?: string): ResponseStatus;
    static for(codeOrResponse: number | Response, text?: string): ResponseStatus | null {
        let code: number;

        if (likeResponse(codeOrResponse)) {
            code = codeOrResponse.status;
            text = codeOrResponse.statusText;
        } else {
            code = codeOrResponse;
        }

        if (statuses.has(code)) {
            return statuses.get(code) as ResponseStatus | null;
        } else if (text?.length) {
            const status = new ResponseStatus(code, text);
            statuses.set(code, status);
            return status;
        }

        return null;
    }

    get [Symbol.toStringTag](): string {
        return `ResponseStatus:${this.code}`;
    }

    /**
     * Whether the status code is in the 1xx informational range.
     */
    get isInformationClass(): boolean {
        return 100 <= this.code && this.code <= 199;
    }

    /**
     * Whether the status code is in the 2xx success range.
     */
    get isSuccessClass(): boolean {
        return 200 <= this.code && this.code <= 299;
    }

    /**
     * Whether the status code is in the 3xx redirect range.
     */
    get isRedirectClass(): boolean {
        return 300 <= this.code && this.code <= 399;
    }

    /**
     * Whether the status code is in the 4xx client error range.
     */
    get isClientErrorClass(): boolean {
        return 400 <= this.code && this.code <= 499;
    }

    /**
     * Whether the status code is in the 5xx server error range.
     */
    get isServerErrorClass(): boolean {
        return 500 <= this.code && this.code <= 599;
    }

    /**
     * Creates a new response status.
     *
     * @param code - The numeric HTTP status code.
     * @param text - The reason phrase.
     */
    constructor(code: number, text: string) {
        /**
         */
        defineProperty(this, 'code', {
            value: code,
            configurable: true,
            enumerable: true,
            writable: false,
        });
        /**
         */
        defineProperty(this, 'text', {
            value: text,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }

    /**
     * Compares this status with another status.
     *
     * @param value - The status to compare against.
     * @returns A negative, zero, or positive comparison result.
     */
    compareTo(value: ResponseStatus): number {
        let comparison: number;

        // Compare code
        comparison = numberComparator.compare(this.code, value.code);
        if (comparison !== 0) {
            return comparison;
        }

        // Compare text
        comparison = stringComparator.compare(this.text, value.text);
        if (comparison !== 0) {
            return comparison;
        }

        return 0;
    }

    /**
     * Tests whether this status matches another status.
     *
     * @param value - The status to compare against.
     * @returns `true` when both code and text match.
     */
    equals(value: ResponseStatus): boolean {
        return this.compareTo(value) === 0;
    }

    /**
     * Creates a `Response` using this status and the supplied body.
     *
     * @param body - The response body.
     * @param headers - Optional headers to apply to the response.
     * @returns A new `Response` using this status code and text.
     */
    createResponse(body: BodyInit, headers: HeadersInit = {}): Response {
        return new Response(body, assign(this.toResponseInit(), { headers }));
    }

    /**
     * Serializes the status to a JSON object.
     *
     * @returns A JSON object containing the status code and text.
     */
    toJSON(): JSONObject {
        const json = createNull();

        json.code = this.code;
        json.text = this.text;

        return json;
    }

    /**
     * Converts the status to `ResponseInit` fields.
     *
     * @returns A `ResponseInit` object with `status` and `statusText`.
     */
    toResponseInit(): ResponseInit {
        const init: ResponseInit = createNull();

        init.status = this.code;
        init.statusText = this.text;

        return init;
    }

    /**
     * Formats the status as `"<code> <text>"`.
     *
     * @returns The formatted status string.
     */
    toString(): string {
        return `${this.code} ${this.text}`;
    }
}

/**
 * Retrieves a matching instance of `ResponseStatus`, or creates it if it does not exist and `text` is provided. Standard HTTP response statuses have already been created.
 * @param {number} code
 * @param {string} [text]
 * @returns {module:http.ResponseStatus}
 * @example
 * const okStatus = ResponseStatus.for( 200 ); // 200 OK
 * const coffeePotStatus = ResponseStatus.for( 419, 'I\'m a coffee pot' ); // 419 I'm a coffee pot
 * const invalidStatus = ResponseStatus.for( 999 ); // null
 */

/**
 * Retrieves a matching instance of `ResponseStatus`, or creates it if it does not exist. Standard HTTP response statuses have already been created.
 * @param {Response} response
 * @returns {module:http.ResponseStatus}
 * @example
 * const response = new Response( null, { status: 200, statusText: "OK" } );
 * const okStatus = ResponseStatus.for( response ); // 200 OK
 */
