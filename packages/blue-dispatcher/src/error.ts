/**
 * @author Jeff Rose
 */

import { FrameworkError } from '@blue/core';
import { Route } from '@blue/router';
import { isString } from '@blue/util';

const { defineProperty } = Reflect;

/**
 * @class module:dispatcher.NoHandlerFoundError
 * @extends module:core.FrameworkError
 */
export class NoHandlerFoundError extends FrameworkError {
    route: Route;

    get [Symbol.toStringTag](): string {
        return 'NoHandlerFoundError';
    }

    constructor(route: Route) {
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
 * @class module:dispatcher.NoViewFoundError
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
 * An error that represents a failure to retrieve a required {@linkcode module:router.Route|Route} property.
 * @class module:dispatcher.RouteBindingError
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
