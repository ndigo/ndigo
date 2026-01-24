/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
import { Constructable } from '@blue/core';
/**
 * @function module:dispatcher.errorHandler
 * @param {external:Error} errorClass
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.errorHandler(2)
 */
export declare const errorHandler: ((target: any) => void) & {
    /**
     * @function module:dispatcher.errorHandler.define
     * @param {*} target
     */
    define: (target: any) => void;
    /**
     * @function module:dispatcher.errorHandler.delete
     * @param {*} target
     */
    delete: (target: any) => boolean;
    /**
     * @function module:dispatcher.errorHandler.get
     * @param {*} target
     * @returns {external:boolean}
     */
    get: (target: any) => boolean;
    /**
     * @function module:dispatcher.errorHandler.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` is defined as an error handler.
     */
    has: (target: any) => boolean;
};
export declare const likeErrorHandler: (value: any) => boolean;
/**
 * @function module:dispatcher.errorMapping
 * @param {external:Error} errorClass
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.errorMapping(2)
 */
export declare const errorMapping: ((errorClass?: Constructable<Error> | Constructable<Error>[]) => (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => PropertyDescriptor) & {
    /**
     * @function module:dispatcher.errorMapping.define
     * @param {*} value
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     */
    define: (value: any, target: any, propertyKey: string | symbol) => void;
    /**
     * @function module:dispatcher.errorMapping.delete
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     */
    delete: (target: any, propertyKey: string | symbol) => boolean;
    /**
     * @function module:dispatcher.errorMapping.get
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     * @returns {external:Array<module:core.Constructable<external:Error>>}
     */
    get: (target: any, propertyKey: string | symbol) => Constructable<Error>[];
    /**
     * @function module:dispatcher.errorMapping.has
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     * @returns {external:boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
     */
    has: (target: any, propertyKey: string | symbol) => boolean;
};
//# sourceMappingURL=error-mapping.d.ts.map