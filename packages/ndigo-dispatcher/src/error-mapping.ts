/**
 * Error-to-resolution mappings.
 */

import '@tsmetadata/polyfill';
import { Constructable, getSymbolMetadata } from '@ndigo/core';
import { isNotNil } from '@ndigo/util/types';
import { makeMethodEnumerable } from './_decorator-util';

function _hasFunction(key: string, obj: unknown): boolean {
    if (obj == null) return false;
    // Arbitrary structured input: reflect the property generically after the nil guard
    const prop = (obj as Record<string, unknown>)[key];
    return prop instanceof Function || Object.prototype.toString.call(prop) === '[Function]';
}

const { assign } = Object;

/**
 * Invoked via the `errorHandler` decorator.
 */
function errorHandlerDecorator(target: unknown, context: ClassDecoratorContext): void {
    context.metadata['error:handler'] = true;
}

/**
 * Get error handler status
 */
const getErrorHandler = (target: unknown): boolean => {
    const metadata = getSymbolMetadata(target);
    return metadata['error:handler'] === true;
};

/**
 * Check if target has error handler metadata
 */
const hasErrorHandler = (target: unknown): boolean => {
    return getErrorHandler(target);
};

/**
 * Invoked via the `errorMapping` decorator.
 */
function errorMappingDecorator(errorClass: Constructable<Error> | Constructable<Error>[] = Error) {
    return function (target: unknown, context: ClassMethodDecoratorContext): void {
        const errors = Array.isArray(errorClass) ? errorClass : [errorClass];
        context.metadata[`error:mapping:${String(context.name)}`] = errors;

        // Make the method enumerable where it is declared so `Object.keys`
        // and for...in discovery find base-class-declared methods too.
        context.addInitializer(function (this: unknown) {
            makeMethodEnumerable(this as object, context.name);
        });
    };
}

/**
 * Get error mapping for a method
 */
const getErrorMapping = (target: unknown, propertyKey: string | symbol): Constructable<Error>[] => {
    const metadata = getSymbolMetadata(target);
    return metadata[`error:mapping:${String(propertyKey)}`];
};

/**
 * Check if method has error mapping
 */
const hasErrorMapping = (target: unknown, propertyKey: string | symbol): boolean => {
    return getErrorMapping(target, propertyKey) !== undefined;
};

/**
 * `errorHandler` is a decorator and a utility object for managing error handler classes.
 * When used as a decorator (the `errorHandler` decorator), it marks a class as an error handler.
 * It also provides `get` and `has` methods to query the error handler status of a class.
 *
 * @example
 * ```typescript
 * @errorHandler()
 * class MyErrorHandler {}
 *
 * const isHandler = errorHandler.has(MyErrorHandler);
 * ```
 */
export const errorHandler = assign(errorHandlerDecorator, {
    get: getErrorHandler,
    has: hasErrorHandler,
});

const constructorIsErrorHandler = (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null || !('constructor' in value)) {
        return false;
    }
    return hasErrorHandler(value.constructor);
};
const _isConstructorErrorHandler = (value: unknown): boolean =>
    _hasFunction('constructor', value) && constructorIsErrorHandler(value);

/**
 * Checks if a given target object or its constructor is an error handler.
 * An object is considered an error handler if it has the the `errorHandler` decorator metadata
 * or if its constructor has the the `errorHandler` decorator metadata.
 *
 * @param target - The object to check.
 * @returns `true` if the target or its constructor is an error handler, `false` otherwise.
 */
export const likeErrorHandler = (target: unknown): boolean =>
    isNotNil(target) && (hasErrorHandler(target) || _isConstructorErrorHandler(target));

/**
 * Export errorMapping with utility methods
 */
export const errorMapping = assign(errorMappingDecorator, {
    get: getErrorMapping,
    has: hasErrorMapping,
});
