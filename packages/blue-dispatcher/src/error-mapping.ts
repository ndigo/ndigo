/**
 * @author Jeff Rose
 */

import 'reflect-metadata';
import { Constructable } from '@blue/core';
import { both, complement, either, propSatisfies } from '@blue/util/logic';
import { propIs } from '@blue/util/types';
import { isNil } from '@blue/util/types';

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
 * @param {Error} errorClass
 * @returns {Function}
 */

/**
 */
export const errorHandler = assign(eh, {
    /**
     * @param {*} target
     */
    define: defineErrorHandler,
    /**
     * @param {*} target
     */
    delete: deleteErrorHandler,
    /**
     * @param {*} target
     * @returns {boolean}
     */
    get: getErrorHandler,
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` is defined as an error handler.
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
 * @param {Error} errorClass
 * @returns {Function}
 */

/**
 */
export const errorMapping = assign(em, {
    /**
     * @param {*} value
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     */
    define: defineErrorMapping,
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     */
    delete: deleteErrorMapping,
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     * @returns {Array<module:core.Constructable<external:Error>>}
     */
    get: getErrorMapping,
    /**
     * @param {*} target
     * @param {string|external:symbol} propertyKey
     * @returns {boolean} Whether or not the `target` and `propertyKey` is defined as an error mapping.
     */
    has: hasErrorMapping,
});
