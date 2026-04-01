/**
 * @author Jeff Rose
 */

import { FrameworkError } from '@blue/core';
import { Route } from '@blue/router';
import { isString } from '@blue/util/types';

const { defineProperty } = Reflect;

/**
 * Error thrown when no suitable handler is found for a given route.
 * This typically indicates a misconfiguration or an unhandled route.
 * @extends module:core.FrameworkError
 */
export class NoHandlerFoundError extends FrameworkError {
    route: Route;

    get [Symbol.toStringTag](): string {
        return 'NoHandlerFoundError';
    }

    constructor(route: Route) {
        /**
         * Creates an instance of NoHandlerFoundError.
         * @param route - The route for which no handler was found.
         */
        super(`No handler found for route "${route.path}"`);
        defineProperty(this, 'route', {
            value: route,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * Error thrown when a view cannot be resolved for a given view name and route.
 * This indicates that the specified view template or component could not be located.
 * @extends module:core.FrameworkError
 */
export class NoViewFoundError extends FrameworkError {
    readonly route: Route;
    readonly viewName: string;

    get [Symbol.toStringTag](): string {
        return 'NoViewFoundError';
    }

    constructor(viewName: string, route: Route) {
        super(`Could not resolve view with name "${viewName}" for route "${route.path}"`);
        defineProperty(this, 'route', {
            value: route,
            configurable: false,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'viewName', {
            value: viewName,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * An error that represents a failure to retrieve a required {@link Route|Route} property.
 * @extends module:core.FrameworkError
 */
export class RouteBindingError extends FrameworkError {
    route: Route;
    name: string;

    get [Symbol.toStringTag](): string {
        return 'RouteBindingError';
    }

    constructor(message: string);
    constructor(route: Route, name: string);
    constructor(routeOrMessage: Route | string, name?: string) {
        if (isString(routeOrMessage)) {
            super(routeOrMessage);
            defineProperty(this, 'route', {
                value: null,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: null,
                configurable: false,
                enumerable: false,
                writable: false,
            });
        } else {
            super(`Unable to bind "${name}" for route "${routeOrMessage.path}"`);
            defineProperty(this, 'route', {
                value: routeOrMessage,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: name,
                configurable: false,
                enumerable: false,
                writable: false,
            });
        }
    }
}

/**
 * Base error for method parameter binding issues.
 * Analogous to Spring's ServletRequestBindingException.
 *
 * @extends module:core.FrameworkError
 */
export class ParameterBindingError extends FrameworkError {
    readonly parameterName: string;
    readonly methodName: string;
    readonly controllerName: string;

    get [Symbol.toStringTag](): string {
        return 'ParameterBindingError';
    }

    constructor(message: string, parameterName?: string, methodName?: string, controllerName?: string) {
        super(message);
        this.name = 'ParameterBindingError';

        defineProperty(this, 'parameterName', {
            value: parameterName ?? null,
            configurable: false,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'methodName', {
            value: methodName ?? null,
            configurable: false,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'controllerName', {
            value: controllerName ?? null,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * Thrown when parameter mapping configuration is invalid.
 * This is a CONFIGURATION error (application startup time).
 *
 * @extends module:dispatcher.ParameterBindingError
 */
export class InvalidParameterMappingError extends ParameterBindingError {
    get [Symbol.toStringTag](): string {
        return 'InvalidParameterMappingError';
    }

    constructor(message: string, parameterName?: string, methodName?: string, controllerName?: string) {
        super(message, parameterName, methodName, controllerName);
        this.name = 'InvalidParameterMappingError';
    }
}

/**
 * Thrown when a required parameter is missing from the request.
 * This is a RUNTIME error (request processing time).
 * Analogous to Spring's MissingServletRequestParameterException.
 *
 * @extends module:dispatcher.ParameterBindingError
 */
export class MissingParameterError extends ParameterBindingError {
    readonly parameterType: string;
    readonly required: boolean;

    get [Symbol.toStringTag](): string {
        return 'MissingParameterError';
    }

    constructor(
        parameterName: string,
        parameterType: string,
        methodName?: string,
        controllerName?: string,
        required: boolean = true
    ) {
        super(
            `Required ${parameterType} parameter '${parameterName}' is missing`,
            parameterName,
            methodName,
            controllerName
        );
        this.name = 'MissingParameterError';

        defineProperty(this, 'parameterType', {
            value: parameterType,
            configurable: false,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'required', {
            value: required,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}

/**
 * Thrown when a parameter converter fails at runtime.
 * This is a RUNTIME error (request processing time).
 *
 * @extends module:dispatcher.ParameterBindingError
 */
export class ParameterConversionError extends ParameterBindingError {
    readonly parameterType: string;
    readonly cause: Error | null;

    get [Symbol.toStringTag](): string {
        return 'ParameterConversionError';
    }

    constructor(
        parameterName: string,
        parameterType: string,
        cause?: Error,
        methodName?: string,
        controllerName?: string
    ) {
        const causeMessage = cause?.message || 'Unknown conversion error';

        super(
            `Failed to convert ${parameterType} parameter '${parameterName}': ${causeMessage}`,
            parameterName,
            methodName,
            controllerName
        );

        this.name = 'ParameterConversionError';

        defineProperty(this, 'parameterType', {
            value: parameterType,
            configurable: false,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'cause', {
            value: cause ?? null,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}
