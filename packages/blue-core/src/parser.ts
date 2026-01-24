/**
 * @author Jeff Rose
 */

export interface Parser<T = any> {
    parse(value: string): T;
}

export interface Stringifier<T = any> {
    stringify(value: T): string;
}

/**
 * @interface module:parser.Parser
 */

/**
 * @function module:parser.Parser#parse
 * @param {external:string} value
 * @returns {T}
 */

/**
 * @interface module:parser.Stringifier
 */

/**
 * @function module:parser.Stringifier#stringify
 * @param {T} value
 * @returns {external:string}
 */
