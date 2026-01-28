/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
import { Constructable } from '@blue/core';
/**
 * @param {Error} errorClass
 * @returns {Function}
 */
/**
 */
export declare const errorHandler: ((target: any) => void) & {
    /**
     * @param {*} target
     */
    define: (target: any) => void;
    /**
     * @param {*} target
     */
    delete: (target: any) => boolean;
    /**
     * @param {*} target
     * @returns {boolean}
     */
    get: (target: any) => boolean;
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` is defined as an error handler.
     */
    has: (target: any) => boolean;
};
export declare const likeErrorHandler: (value: any) => boolean;
/**
 * @param {Error} errorClass
 * @returns {Function}
 */
/**
 */
export declare const errorMapping: ((errorClass?: Constructable<Error> | Constructable<Error>[]) => (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor) & {
    /**
     * @param {*} value
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     */
    define: (value: any, target: any, propertyKey: string | symbol) => void;
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     */
    delete: (target: any, propertyKey: string | symbol) => boolean;
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     * @returns {Array<module:core.Constructable<external:Error>>}
     */
    get: (target: any, propertyKey: string | symbol) => Constructable<Error>[];
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     * @returns {boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
     */
    has: (target: any, propertyKey: string | symbol) => boolean;
};
//# sourceMappingURL=error-mapping.d.ts.map