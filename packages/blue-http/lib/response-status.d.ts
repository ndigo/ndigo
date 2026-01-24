/**
 * @author Jeff Rose
 */
import { Comparable, Equatable, JSONObject, Serializable } from '@blue/core';
/**
 * @class module:http.ResponseStatus
 * @implements module:core.Comparable
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 * @param {external:number} code
 * @param {external:string} text
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
     * @member {external:boolean} module:http.ResponseStatus#isInformationClass
     */
    get isInformationClass(): boolean;
    /**
     * Whether or not the response status code is between 200 and 299.
     * @member {external:boolean} module:http.ResponseStatus#isSuccessClass
     */
    get isSuccessClass(): boolean;
    /**
     * Whether or not the response status code is between 300 and 399.
     * @member {external:boolean} module:http.ResponseStatus#isRedirectClass
     */
    get isRedirectClass(): boolean;
    /**
     * Whether or not the response status code is between 400 and 499.
     * @member {external:boolean} module:http.ResponseStatus#isClientErrorClass
     */
    get isClientErrorClass(): boolean;
    /**
     * Whether or not the response status code is between 500 and 599.
     * @member {external:boolean} module:http.ResponseStatus#isServerErrorClass
     */
    get isServerErrorClass(): boolean;
    constructor(code: number, text: string);
    /**
     * @function module:http.ResponseStatus#compareTo
     * @param {module:http.ResponseStatus} value
     * @returns {external:number}
     */
    compareTo(value: ResponseStatus): number;
    /**
     * @function module:http.ResponseStatus#equals
     * @param {module:http.ResponseStatus} value
     * @returns {external:boolean}
     */
    equals(value: ResponseStatus): boolean;
    /**
     * @function module:http.ResponseStatus#createResponse
     * @param {external:BodyInit} body
     * @param {external:HeadersInit} [headers={}]
     * @returns {external:Response}
     */
    createResponse(body: BodyInit, headers?: HeadersInit): Response;
    /**
     * @function module:http.ResponseStatus#toJSON
     * @returns {module:core.JSONObject}
     */
    toJSON(): JSONObject;
    /**
     * @function module:http.ResponseStatus#toResponseInit
     * @returns {external:ResponseInit}
     */
    toResponseInit(): ResponseInit;
    /**
     * @function module:http.ResponseStatus#toString
     * @returns {external:string}
     */
    toString(): string;
}
/**
 * Retrieves a matching instance of `ResponseStatus`, or creates it if it does not exist and `text` is provided. Standard HTTP response statuses have already been created.
 * @function module:http.ResponseStatus.for
 * @param {external:number} code
 * @param {external:string} [text]
 * @returns {module:http.ResponseStatus}
 * @example
 * const okStatus = ResponseStatus.for( 200 ); // 200 OK
 * const coffeePotStatus = ResponseStatus.for( 419, 'I\'m a coffee pot' ); // 419 I'm a coffee pot
 * const invalidStatus = ResponseStatus.for( 999 ); // null
 */
/**
 * Retrieves a matching instance of `ResponseStatus`, or creates it if it does not exist. Standard HTTP response statuses have already been created.
 * @function module:http.ResponseStatus.for
 * @param {external:Response} response
 * @returns {module:http.ResponseStatus}
 * @example
 * const response = new Response( null, { status: 200, statusText: "OK" } );
 * const okStatus = ResponseStatus.for( response ); // 200 OK
 */
//# sourceMappingURL=response-status.d.ts.map