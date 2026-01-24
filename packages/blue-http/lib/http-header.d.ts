/**
 * @author Jeff Rose
 */
import { JSONValue, Serializable } from '@blue/core';
/**
 * @class module:http.HTTPHeader
 * @implements module:core.Serializable
 */
export declare class HTTPHeader implements Serializable {
    readonly name: string;
    get [Symbol.toStringTag](): string;
    constructor(name: string);
    delete(headers: HeadersInit): void;
    get(headers: HeadersInit): string;
    has(headers: HeadersInit): boolean;
    set(headers: HeadersInit, value: any): void;
    /**
     * @function module:http.HTTPHeader#toJSON
     * @returns {module:core.JSONObject} A JSON representation of the HTTP header
     */
    toJSON(): JSONValue;
    /**
     * @function module:http.HTTPHeader#toString
     * @returns {external:string} A string representation of the HTTP header
     */
    toString(): string;
}
//# sourceMappingURL=http-header.d.ts.map