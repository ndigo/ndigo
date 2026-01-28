/**
 * @author Jeff Rose
 */
import { createNull, numberComparator, stringComparator, } from '@blue/core';
import { likeResponse } from './like-response';
const { assign } = Object, { defineProperty } = Reflect, statuses = new Map();
/**
 * @implements module:core.Comparable
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 * @param {number} code
 * @param {string} text
 * @see {@link https://tools.ietf.org/html/rfc2616#section-10}
 */
export default class ResponseStatus {
    code;
    text;
    static for(codeOrResponse, text) {
        let code;
        if (likeResponse(codeOrResponse)) {
            code = codeOrResponse.status;
            text = codeOrResponse.statusText;
        }
        else {
            code = codeOrResponse;
        }
        if (statuses.has(code)) {
            return statuses.get(code);
        }
        else if (text?.length) {
            const status = new ResponseStatus(code, text);
            statuses.set(code, status);
            return status;
        }
        return null;
    }
    get [Symbol.toStringTag]() {
        return `ResponseStatus:${this.code}`;
    }
    /**
     * Whether or not the response status code is between 100 and 199.
     */
    get isInformationClass() {
        return 100 <= this.code && this.code <= 199;
    }
    /**
     * Whether or not the response status code is between 200 and 299.
     */
    get isSuccessClass() {
        return 200 <= this.code && this.code <= 299;
    }
    /**
     * Whether or not the response status code is between 300 and 399.
     */
    get isRedirectClass() {
        return 300 <= this.code && this.code <= 399;
    }
    /**
     * Whether or not the response status code is between 400 and 499.
     */
    get isClientErrorClass() {
        return 400 <= this.code && this.code <= 499;
    }
    /**
     * Whether or not the response status code is between 500 and 599.
     */
    get isServerErrorClass() {
        return 500 <= this.code && this.code <= 599;
    }
    constructor(code, text) {
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
    compareTo(value) {
        let comparison;
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
    equals(value) {
        return this.compareTo(value) === 0;
    }
    /**
     * @param {BodyInit} body
     * @param {HeadersInit} [headers={}]
     * @returns {Response}
     */
    createResponse(body, headers = {}) {
        return new Response(body, assign(this.toResponseInit(), { headers }));
    }
    /**
     * @returns {module:core.JSONObject}
     */
    toJSON() {
        const json = createNull();
        json.code = this.code;
        json.text = this.text;
        return json;
    }
    /**
     * @returns {ResponseInit}
     */
    toResponseInit() {
        const init = createNull();
        init.status = this.code;
        init.statusText = this.text;
        return init;
    }
    /**
     * @returns {string}
     */
    toString() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2Utc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc3BvbnNlLXN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFFSCxVQUFVLEVBR1YsZ0JBQWdCLEVBRWhCLGdCQUFnQixHQUNuQixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDckIsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVCLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztBQUVqRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFjO0lBQ3RCLElBQUksQ0FBUztJQUNiLElBQUksQ0FBUztJQUl0QixNQUFNLENBQUMsR0FBRyxDQUFDLGNBQWlDLEVBQUUsSUFBYTtRQUN2RCxJQUFJLElBQVksQ0FBQztRQUVqQixJQUFJLFlBQVksQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQy9CLElBQUksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO1lBQzdCLElBQUksR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO1FBQ3JDLENBQUM7YUFBTSxDQUFDO1lBQ0osSUFBSSxHQUFHLGNBQWMsQ0FBQztRQUMxQixDQUFDO1FBRUQsSUFBSSxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDckIsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUM7YUFBTSxJQUFJLElBQUksRUFBRSxNQUFNLEVBQUUsQ0FBQztZQUN0QixNQUFNLE1BQU0sR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxD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