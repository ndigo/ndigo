import '@tsmetadata/polyfill';
import { Constructable, getSymbolMetadata } from '@blue/core';
import { propIs, isNotNil } from '@blue/util/types';

function _hasFunction(key: string, obj: any): boolean {
    return propIs(Function, key, obj);
}

const { assign, getOwnPropertyDescriptor } = Object;
const { defineProperty } = Reflect;

/**
 * Invoked via the `errorHandler` decorator.
 */
function errorHandlerDecorator(target: any, context: ClassDecoratorContext): any {
    context.metadata['error:handler'] = true;
    return target;
}

/**
 * Get error handler status
 */
const getErrorHandler = (target: any): boolean => {
    const metadata = getSymbolMetadata(target);
    return metadata['error:handler'] === true;
};

/**
 * Check if target has error handler metadata
 */
const hasErrorHandler = (target: any): boolean => {
    return getErrorHandler(target);
};

/**
 * Invoked via the `errorMapping` decorator.
 */
function errorMappingDecorator(errorClass: Constructable<Error> | Constructable<Error>[] = Error) {
    return function (target: any, context: ClassMethodDecoratorContext): void {
        const errors = Array.isArray(errorClass) ? errorClass : [errorClass];
        context.metadata[`error:mapping:${String(context.name)}`] = errors;

        // Make method enumerable
        context.addInitializer(function (this: any) {
            const descriptor = getOwnPropertyDescriptor(Object.getPrototypeOf(this), context.name);
            if (descriptor && !descriptor.enumerable) {
                defineProperty(Object.getPrototypeOf(this), context.name, {
                    ...descriptor,
                    enumerable: true,
                });
            }
        });
    };
}

/**
 * Get error mapping for a method
 */
const getErrorMapping = (target: any, propertyKey: string | symbol): Constructable<Error>[] => {
    const metadata = getSymbolMetadata(target);
    return metadata[`error:mapping:${String(propertyKey)}`];
};

/**
 * Check if method has error mapping
 */
const hasErrorMapping = (target: any, propertyKey: string | symbol): boolean => {
    return getErrorMapping(target, propertyKey) !== undefined;
};

/**
 * `errorHandler` is a decorator and a utility object for managing error handler classes.
 * When used as a decorator (the `errorHandler` decorator), it marks a class as an error handler.
 * It also provides `get` and `has` methods to query the error handler status of a class.
 *
 * @example
 * ```typescript
 * Invoked via the `errorHandler` decorator.
 *   // ...
 * }
 *
 * const isHandler = errorHandler.has(MyErrorHandler);
 * ```
 */
export const errorHandler = assign(errorHandlerDecorator, {
    get: getErrorHandler,
    has: hasErrorHandler,
});

const constructorIsErrorHandler = (value: any): boolean => hasErrorHandler(value?.constructor);
const _isConstructorErrorHandler = (value: any): boolean =>
    _hasFunction('constructor', value) && constructorIsErrorHandler(value);

/**
 * Checks if a given target object or its constructor is an error handler.
 * An object is considered an error handler if it has the the `errorHandler` decorator metadata
 * or if its constructor has the the `errorHandler` decorator metadata.
 *
 * @param target The object to check.
 * @returns `true` if the target or its constructor is an error handler, `false` otherwise.
 */
export const likeErrorHandler = (target: any): boolean =>
    isNotNil(target) && (hasErrorHandler(target) || _isConstructorErrorHandler(target));

/**
 * Export errorMapping with utility methods
 */
export const errorMapping = assign(errorMappingDecorator, {
    get: getErrorMapping,
    has: hasErrorMapping,
});
