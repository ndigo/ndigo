/**
 * `@socketMapping` — WebSocket route mapping decorator (RFC 6455).
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError, getSymbolMetadata } from '@blue/core';
import { routeMapping, RouteMappingConfiguration } from './route-mapping';

/** Metadata key marking a method as a WebSocket endpoint. */
export const SOCKET_MAPPING_KEY = 'route:socket';

/**
 * Marks a method as a WebSocket endpoint at the given path.
 *
 * @param route - The path to serve WebSocket connections at, relative to any
 *   class-level mapping, or a full mapping configuration.
 * @returns A method decorator.
 */
export function socketMapping(route: string | RouteMappingConfiguration) {
    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        if (context.kind !== 'method') {
            throw new FrameworkError('@socketMapping is a method-only decorator.');
        }
        // Per-method marker so isSocketMapping can distinguish the socket
        // endpoint from sibling HTTP methods on the same controller.
        context.metadata[`${SOCKET_MAPPING_KEY}:${String(context.name)}`] = true;
        const routeDecorator = routeMapping(route);
        routeDecorator(target, context);
    };
}

/**
 * Whether the given method is a WebSocket endpoint.
 *
 * `@socketMapping` writes a `route:socket:<method>` marker into the shared
 * `Symbol.metadata` record alongside the method's `route:mapping:<name>`
 * entry, so a method is a socket endpoint when both are present.
 *
 * @param target - The class constructor or prototype to inspect.
 * @param propertyKey - The method name.
 * @returns `true` when the method is socket-mapped.
 */
export function isSocketMapping(target: unknown, propertyKey: string | symbol): boolean {
    const metadata = getSymbolMetadata(target);
    return (
        metadata[`${SOCKET_MAPPING_KEY}:${String(propertyKey)}`] === true &&
        metadata[`route:mapping:${String(propertyKey)}`] !== undefined
    );
}
