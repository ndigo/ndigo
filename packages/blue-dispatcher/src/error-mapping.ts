/**
 * @author Jeff Rose
 */

import 'reflect-metadata';
import { Constructable } from '@blue/core';
import { both, complement, either, isNil, propIs, propSatisfies } from '@blue/util';

const ERROR_HANDLER = 'error:handler',
    ERROR_MAPPING = 'error:mapping',
    { assign } = Object,
    { defineMetadata, deleteMetadata, getMetadata, getOwnPropertyDescriptor, hasMetadata } = Reflect,
    hasFunction = propIs(Function),
    defineErrorHandler = (target): void => defineMetadata(ERROR_HANDLER, true, target),
    defineErrorMapping = (value, target, propertyKey: string | symbol): void =>
        defineMetadata(ERROR_MAPPING, value, target, propertyKey),
    deleteErrorHandler = (target) => deleteMetadata(ERROR_HANDLER, target),
    deleteErrorMapping = (target, propertyKey: string | symbol) => deleteMetadata(ERROR_MAPPING, target, propertyKey),
    getErrorHandler = (target): boolean => getMetadata(ERROR_HANDLER, target),
    getErrorMapping = (target, propertyKey: string | symbol): Constructable<Error>[] =>
        getMetadata(ERROR_MAPPING, target, propertyKey),
    hasErrorHandler = (target): boolean => hasMetadata(ERROR_HANDLER, target),
    hasErrorMapping = (target, propertyKey: string | symbol): boolean =>
        hasMetadata(ERROR_MAPPING, target, propertyKey),
    eh = (target) => defineErrorHandler(target),
    em =
        (errorClass: Constructable<Error> | Constructable<Error>[] = Error) =>
        (target, propertyKey: string | symbol, descriptor: PropertyDescriptor): PropertyDescriptor => {
            defineErrorMapping(Array.isArray(errorClass) ? errorClass : [errorClass], target, propertyKey);
            if (!descriptor) {
                descriptor = getOwnPropertyDescriptor(target, propertyKey);
            }
            descriptor.enumerable = true;
            return descriptor;
        };

/**
 * @function module:dispatcher.errorHandler
 * @param {external:Error} errorClass
 * @returns {external:Function}
 */

/**
 * @const {external:ClassDecorator} module:dispatcher.errorHandler(2)
 */
export const errorHandler = assign(eh, {
    /**
     * @function module:dispatcher.errorHandler.define
     * @param {*} target
     */
    define: defineErrorHandler,
    /**
     * @function module:dispatcher.errorHandler.delete
     * @param {*} target
     */
    delete: deleteErrorHandler,
    /**
     * @function module:dispatcher.errorHandler.get
     * @param {*} target
     * @returns {external:boolean}
     */
    get: getErrorHandler,
    /**
     * @function module:dispatcher.errorHandler.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` is defined as an error handler.
     */
    has: hasErrorHandler,
});

const isDefined = complement(isNil),
    hasConstructor = hasFunction('constructor'),
    constructorIsErrorHandler = propSatisfies(hasErrorHandler, 'constructor');

export const likeErrorHandler = both(
    isDefined,
    either(hasErrorHandler, both(hasConstructor, constructorIsErrorHandler))
);

/**
 * @function module:dispatcher.errorMapping
 * @param {external:Error} errorClass
 * @returns {external:Function}
 */

/**
 * @const {external:ClassDecorator} module:dispatcher.errorMapping(2)
 */
export const errorMapping = assign(em, {
    /**
     * @function module:dispatcher.errorMapping.define
     * @param {*} value
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     */
    define: defineErrorMapping,
    /**
     * @function module:dispatcher.errorMapping.delete
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     */
    delete: deleteErrorMapping,
    /**
     * @function module:dispatcher.errorMapping.get
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     * @returns {external:Array<module:core.Constructable<external:Error>>}
     */
    get: getErrorMapping,
    /**
     * @function module:dispatcher.errorMapping.has
     * @param {*} target
     * @param {external:string|external:symbol} propertyKey
     * @returns {external:boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
     */
    has: hasErrorMapping,
});
