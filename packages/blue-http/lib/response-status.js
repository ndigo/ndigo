/**
 * @author Jeff Rose
 */
import { createNull, numberComparator, stringComparator, } from '@blue/core';
import { likeResponse } from './like-response';
const { assign } = Object, { defineProperty } = Reflect, statuses = new Map();
/**
 * @class module:http.ResponseStatus
 * @implements module:core.Comparable
 * @implements module:core.Equatable
 * @implements module:core.Serializable
 * @param {external:number} code
 * @param {external:string} text
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
     * @member {external:boolean} module:http.ResponseStatus#isInformationClass
     */
    get isInformationClass() {
        return 100 <= this.code && this.code <= 199;
    }
    /**
     * Whether or not the response status code is between 200 and 299.
     * @member {external:boolean} module:http.ResponseStatus#isSuccessClass
     */
    get isSuccessClass() {
        return 200 <= this.code && this.code <= 299;
    }
    /**
     * Whether or not the response status code is between 300 and 399.
     * @member {external:boolean} module:http.ResponseStatus#isRedirectClass
     */
    get isRedirectClass() {
        return 300 <= this.code && this.code <= 399;
    }
    /**
     * Whether or not the response status code is between 400 and 499.
     * @member {external:boolean} module:http.ResponseStatus#isClientErrorClass
     */
    get isClientErrorClass() {
        return 400 <= this.code && this.code <= 499;
    }
    /**
     * Whether or not the response status code is between 500 and 599.
     * @member {external:boolean} module:http.ResponseStatus#isServerErrorClass
     */
    get isServerErrorClass() {
        return 500 <= this.code && this.code <= 599;
    }
    constructor(code, text) {
        /**
         * @member {external:number} code
         */
        defineProperty(this, 'code', {
            value: code,
            configurable: true,
            enumerable: true,
            writable: false,
        });
        /**
         * @member {external:string} text
         */
        defineProperty(this, 'text', {
            value: text,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }
    /**
     * @function module:http.ResponseStatus#compareTo
     * @param {module:http.ResponseStatus} value
     * @returns {external:number}
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
     * @function module:http.ResponseStatus#equals
     * @param {module:http.ResponseStatus} value
     * @returns {external:boolean}
     */
    equals(value) {
        return this.compareTo(value) === 0;
    }
    /**
     * @function module:http.ResponseStatus#createResponse
     * @param {external:BodyInit} body
     * @param {external:HeadersInit} [headers={}]
     * @returns {external:Response}
     */
    createResponse(body, headers = {}) {
        return new Response(body, assign(this.toResponseInit(), { headers }));
    }
    /**
     * @function module:http.ResponseStatus#toJSON
     * @returns {module:core.JSONObject}
     */
    toJSON() {
        const json = createNull();
        json.code = this.code;
        json.text = this.text;
        return json;
    }
    /**
     * @function module:http.ResponseStatus#toResponseInit
     * @returns {external:ResponseInit}
     */
    toResponseInit() {
        const init = createNull();
        init.status = this.code;
        init.statusText = this.text;
        return init;
    }
    /**
     * @function module:http.ResponseStatus#toString
     * @returns {external:string}
     */
    toString() {
        return `${this.code} ${this.text}`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2Utc3RhdHVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3Jlc3BvbnNlLXN0YXR1cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFFSCxVQUFVLEVBR1YsZ0JBQWdCLEVBRWhCLGdCQUFnQixHQUNuQixNQUFNLFlBQVksQ0FBQztBQUNwQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFL0MsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDckIsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVCLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztBQUVqRDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sY0FBYztJQUN0QixJQUFJLENBQVM7SUFDYixJQUFJLENBQVM7SUFJdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxjQUFpQyxFQUFFLElBQWE7UUFDdkQsSUFBSSxJQUFZLENBQUM7UUFFakIsSUFBSSxZQUFZLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUMvQixJQUFJLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQztZQUM3QixJQUFJLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQztRQUNyQyxDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksR0FBRyxjQUFjLENBQUM7UUFDMUIsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3JCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixDQUFDO2FBQU0sSUFBSSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7WUFDdEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzlDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0s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