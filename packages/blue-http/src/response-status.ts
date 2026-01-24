/**
 * @author Jeff Rose
 */

import { Comparable, createNull, Equatable, JSONObject, numberComparator, Serializable, stringComparator } from '@blue/core';
import { likeResponse } from './like-response';

const
    { assign } = Object,
    { defineProperty } = Reflect,
    statuses = new Map<number, ResponseStatus>();

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

    static for( response: Response ): ResponseStatus;
    static for( code: number, text?: string ): ResponseStatus;
    static for( codeOrResponse: number | Response, text?: string ): ResponseStatus {
        let code: number;

        if( likeResponse( codeOrResponse ) ){
            code = codeOrResponse.status;
            text = codeOrResponse.statusText;
        } else {
            code = codeOrResponse;
        }

        if( statuses.has( code ) ){
            return statuses.get( code );
        } else if( text?.length ){
            const status = new ResponseStatus( code, text );
            statuses.set( code, status );
            return status;
        }

        return null;
    }

    get [ Symbol.toStringTag ](): string {
        return `ResponseStatus:${ this.code }`;
    }

    /**
     * Whether or not the response status code is between 100 and 199.
     * @member {external:boolean} module:http.ResponseStatus#isInformationClass
     */
    get isInformationClass(): boolean {
        return 100 <= this.code && this.code <= 199;
    }

    /**
     * Whether or not the response status code is between 200 and 299.
     * @member {external:boolean} module:http.ResponseStatus#isSuccessClass
     */
    get isSuccessClass(): boolean {
        return 200 <= this.code && this.code <= 299;
    }

    /**
     * Whether or not the response status code is between 300 and 399.
     * @member {external:boolean} module:http.ResponseStatus#isRedirectClass
     */
    get isRedirectClass(): boolean {
        return 300 <= this.code && this.code <= 399;
    }

    /**
     * Whether or not the response status code is between 400 and 499.
     * @member {external:boolean} module:http.ResponseStatus#isClientErrorClass
     */
    get isClientErrorClass(): boolean {
        return 400 <= this.code && this.code <= 499;
    }

    /**
     * Whether or not the response status code is between 500 and 599.
     * @member {external:boolean} module:http.ResponseStatus#isServerErrorClass
     */
    get isServerErrorClass(): boolean {
        return 500 <= this.code && this.code <= 599;
    }

    constructor( code: number, text: string ){
        /**
         * @member {external:number} code
         */
        defineProperty( this, 'code', {
            value: code,
            configurable: true,
            enumerable: true,
            writable: false
        } );
        /**
         * @member {external:string} text
         */
        defineProperty( this, 'text', {
            value: text,
            configurable: true,
            enumerable: true,
            writable: false
        } );
    }

    /**
     * @function module:http.ResponseStatus#compareTo
     * @param {module:http.ResponseStatus} value
     * @returns {external:number}
     */
    compareTo( value: ResponseStatus ): number {
        let comparison: number;

        // Compare code
        comparison = numberComparator.compare( this.code, value.code );
        if( comparison !== 0 ){
            return comparison;
        }

        // Compare text
        comparison = stringComparator.compare( this.text, value.text );
        if( comparison !== 0 ){
            return comparison;
        }

        return 0;
    }

    /**
     * @function module:http.ResponseStatus#equals
     * @param {module:http.ResponseStatus} value
     * @returns {external:boolean}
     */
    equals( value: ResponseStatus ): boolean {
        return this.compareTo( value ) === 0;
    }

    /**
     * @function module:http.ResponseStatus#createResponse
     * @param {external:BodyInit} body
     * @param {external:HeadersInit} [headers={}]
     * @returns {external:Response}
     */
    createResponse( body: BodyInit, headers: HeadersInit = {} ): Response {
        return new Response( body, assign( this.toResponseInit(), { headers } ) );
    }

    /**
     * @function module:http.ResponseStatus#toJSON
     * @returns {module:core.JSONObject}
     */
    toJSON(): JSONObject {
        const json = createNull();

        json.code = this.code;
        json.text = this.text;

        return json;
    }

    /**
     * @function module:http.ResponseStatus#toResponseInit
     * @returns {external:ResponseInit}
     */
    toResponseInit(): ResponseInit {
        const init: ResponseInit = createNull();

        init.status = this.code;
        init.statusText = this.text;

        return init;
    }

    /**
     * @function module:http.ResponseStatus#toString
     * @returns {external:string}
     */
    toString(): string {
        return `${ this.code } ${ this.text }`;
    }
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
