/**
 */
import { FrameworkError } from '@ndigo/core';
import { Route } from '@ndigo/router';
import { isString } from '@ndigo/util/types';

const { defineProperty } = Reflect;

/**
 * Error thrown when no suitable handler is found for a given route.
 * This typically indicates a misconfiguration or an unhandled route.
 */
export class NoHandlerFoundError extends FrameworkError {
    route!: Route;

    get [Symbol.toStringTag](): string {
        return 'NoHandlerFoundError';
    }

    constructor(route: Route) {
        /**
         * Creates an instance of NoHandlerFoundError.
         * @param route - The route for which no handler was found.
         */
        super(`No handler found for route "${route.path}"`);
        this.route = route;
    }
}

/**
 * Error thrown when a view cannot be resolved for a given view name and route.
 * This indicates that the specified view template or component could not be located.
 */
export class NoViewFoundError extends FrameworkError {
    readonly route!: Route;
    readonly viewName!: string;

    get [Symbol.toStringTag](): string {
        return 'NoViewFoundError';
    }

    constructor(viewName: string, route: Route) {
        super(`Could not resolve view with name "${viewName}" for route "${route.path}"`);
        this.route = route;
        this.viewName = viewName;
    }
}

/**
 * An error that represents a failure to retrieve a required {@link Route|Route} property.
 */
export class RouteBindingError extends FrameworkError {
    route!: Route | null;
    name!: string;

    get [Symbol.toStringTag](): string {
        return 'RouteBindingError';
    }

    constructor(message: string);
    constructor(route: Route, name: string);
    constructor(routeOrMessage: Route | string, name?: string) {
        if (isString(routeOrMessage)) {
            super(routeOrMessage);
            this.route = null;
            this.name = '';
        } else {
            super(`Unable to bind "${name}" for route "${routeOrMessage.path}"`);
            this.route = routeOrMessage;
            this.name = name ?? '';
        }
    }
}

/**
 * Base error for method parameter binding issues.
 * Analogous to the request-binding error model.
 *
 */
export class ParameterBindingError extends FrameworkError {
    readonly parameterName!: string | null;
    readonly methodName!: string | null;
    readonly controllerName!: string | null;

    get [Symbol.toStringTag](): string {
        return 'ParameterBindingError';
    }

    constructor(message: string, parameterName?: string, methodName?: string, controllerName?: string) {
        super(message);

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
 */
export class InvalidParameterMappingError extends ParameterBindingError {
    get [Symbol.toStringTag](): string {
        return 'InvalidParameterMappingError';
    }

    constructor(message: string, parameterName?: string, methodName?: string, controllerName?: string) {
        super(message, parameterName, methodName, controllerName);
    }
}

/**
 * Thrown when a required parameter is missing from the request.
 * This is a RUNTIME error (request processing time).
 * Analogous to the missing-parameter binding error.
 *
 */
export class MissingParameterError extends ParameterBindingError {
    readonly parameterType!: string | null;
    readonly required!: boolean | null;

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
 */
export class ParameterConversionError extends ParameterBindingError {
    readonly parameterType!: string | null;
    readonly cause!: Error | null;

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
