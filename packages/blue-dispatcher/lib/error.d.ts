/**
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';
import { Route } from '@blue/router';
/**
 * @class module:dispatcher.NoHandlerFoundError
 * @extends module:core.FrameworkError
 */
export declare class NoHandlerFoundError extends FrameworkError {
    route: Route;
    get [Symbol.toStringTag](): string;
    constructor(route: Route);
}
/**
 * @class module:dispatcher.NoViewFoundError
 * @extends module:core.FrameworkError
 */
export declare class NoViewFoundError extends FrameworkError {
    readonly route: Route;
    readonly viewName: string;
    get [Symbol.toStringTag](): string;
    constructor(viewName: string, route: Route);
}
/**
 * An error that represents a failure to retrieve a required {@linkcode module:router.Route|Route} property.
 * @class module:dispatcher.RouteBindingError
 * @extends module:core.FrameworkError
 */
export declare class RouteBindingError extends FrameworkError {
    route: Route;
    name: string;
    get [Symbol.toStringTag](): string;
    constructor(message: string);
    constructor(route: Route, name: string);
}
//# sourceMappingURL=error.d.ts.map