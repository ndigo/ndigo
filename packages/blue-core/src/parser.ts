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
 */

/**
 * @param {string} value
 * @returns {T}
 */

/**
 */

/**
 * @param {T} value
 * @returns {string}
 */
