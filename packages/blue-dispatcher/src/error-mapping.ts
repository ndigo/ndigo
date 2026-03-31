/**
 * @author Jeff Rose
 */

import '@tsmetadata/polyfill';
import { Constructable, getSymbolMetadata } from '@blue/core';
import { both, either, propSatisfies } from '@blue/util/logic';
import { propIs, isNotNil } from '@blue/util/types';

const { assign, getOwnPropertyDescriptor } = Object;
const { defineProperty } = Reflect;
const hasFunction = propIs(Function);

/**
 * @errorHandler decorator - marks a class as an error handler
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
 * @errorMapping decorator - maps error classes to handler methods
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
 * Export errorHandler with utility methods
 */
export const errorHandler = assign(errorHandlerDecorator, {
    get: getErrorHandler,
    has: hasErrorHandler,
});

const hasConstructor = hasFunction('constructor');
const constructorIsErrorHandler = propSatisfies(hasErrorHandler, 'constructor');

export const likeErrorHandler = both(
    isNotNil,
    either(hasErrorHandler, both(hasConstructor, constructorIsErrorHandler))
);

/**
 * Export errorMapping with utility methods
 */
export const errorMapping = assign(errorMappingDecorator, {
    get: getErrorMapping,
    has: hasErrorMapping,
});
