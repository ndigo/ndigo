/**
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
 * @implements module:core.Comparable
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 * @param {number} code
 * @param {string} text
 * @see {@link https://tools.ietf.org/html/rfc2616#section-10}
 */
export default class ResponseStatus implements Comparable<ResponseStatus>, Equatable, Serializable {
    readonly code: number;
    readonly text: string;

    static for(response: Response): ResponseStatus;
    static for(code: number, text?: string): ResponseStatus;
    static for(codeOrResponse: number | Response, text?: string): ResponseStatus {
        let code: number;

        if (likeResponse(codeOrResponse)) {
            code = codeOrResponse.status;
            text = codeOrResponse.statusText;
        } else {
            code = codeOrResponse;
        }

        if (statuses.has(code)) {
            return statuses.get(code);
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
     * Whether or not the response status code is between 100 and 199.
         */
    get isInformationClass(): boolean {
        return 100 <= this.code && this.code <= 199;
    }

    /**
     * Whether or not the response status code is between 200 and 299.
         */
    get isSuccessClass(): boolean {
        return 200 <= this.code && this.code <= 299;
    }

    /**
     * Whether or not the response status code is between 300 and 399.
         */
    get isRedirectClass(): boolean {
        return 300 <= this.code && this.code <= 399;
    }

    /**
     * Whether or not the response status code is between 400 and 499.
         */
    get isClientErrorClass(): boolean {
        return 400 <= this.code && this.code <= 499;
    }

    /**
     * Whether or not the response status code is between 500 and 599.
         */
    get isServerErrorClass(): boolean {
        return 500 <= this.code && this.code <= 599;
    }

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
         * @param {module:http.ResponseStatus} value
     * @returns {number}
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
         * @param {module:http.ResponseStatus} value
     * @returns {boolean}
     */
    equals(value: ResponseStatus): boolean {
        return this.compareTo(value) === 0;
    }

    /**
         * @param {BodyInit} body
     * @param {HeadersInit} [headers={}]
     * @returns {Response}
     */
    createResponse(body: BodyInit, headers: HeadersInit = {}): Response {
        return new Response(body, assign(this.toResponseInit(), { headers }));
    }

    /**
         * @returns {module:core.JSONObject}
     */
    toJSON(): JSONObject {
        const json = createNull();

        json.code = this.code;
        json.text = this.text;

        return json;
    }

    /**
         * @returns {ResponseInit}
     */
    toResponseInit(): ResponseInit {
        const init: ResponseInit = createNull();

        init.status = this.code;
        init.statusText = this.text;

        return init;
    }

    /**
         * @returns {string}
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
