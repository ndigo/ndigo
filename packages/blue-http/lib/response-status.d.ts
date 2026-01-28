/**
 * @author Jeff Rose
 */
import { Comparable, Equatable, JSONObject, Serializable } from '@blue/core';
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
    get [Symbol.toStringTag](): string;
    /**
     * Whether or not the response status code is between 100 and 199.
     */
    get isInformationClass(): boolean;
    /**
     * Whether or not the response status code is between 200 and 299.
     */
    get isSuccessClass(): boolean;
    /**
     * Whether or not the response status code is between 300 and 399.
     */
    get isRedirectClass(): boolean;
    /**
     * Whether or not the response status code is between 400 and 499.
     */
    get isClientErrorClass(): boolean;
    /**
     * Whether or not the response status code is between 500 and 599.
     */
    get isServerErrorClass(): boolean;
    constructor(code: number, text: string);
    /**
     * @param {module:http.ResponseStatus} value
     * @returns {number}
     */
    compareTo(value: ResponseStatus): number;
    /**
     * @param {module:http.ResponseStatus} value
     * @returns {boolean}
     */
    equals(value: ResponseStatus): boolean;
    /**
     * @param {BodyInit} body
     * @param {HeadersInit} [headers={}]
     * @returns {Response}
     */
    createResponse(body: BodyInit, headers?: HeadersInit): Response;
    /**
     * @returns {module:core.JSONObject}
     */
    toJSON(): JSONObject;
    /**
     * @returns {ResponseInit}
     */
    toResponseInit(): ResponseInit;
    /**
     * @returns {string}
     */
    toString(): string;
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
//# sourceMappingURL=response-status.d.ts.map