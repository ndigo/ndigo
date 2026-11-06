/**
 * `@stompMapping` — STOMP-over-WebSocket route decorator (AD-23 D4).
 *
 * A `@stompMapping` method is a `@socketMapping` endpoint whose
 * connections speak the STOMP 1.2 protocol (destinations, subscriptions,
 * frames). The decorator writes both the socket marker and a
 * `route:stomp:<method>` marker; the Node adapter consults the marker to
 * negotiate the `v12.stomp` / `v11.stomp` / `v10.stomp` WebSocket
 * subprotocol during the upgrade handshake.
 */
import { FrameworkError, getSymbolMetadata } from '@ndigo/core';
import { socketMapping } from './socket-mapping';
import type { RouteMappingConfiguration } from './route-mapping';

/** Metadata key marking a method as a STOMP endpoint. */
export const STOMP_MAPPING_KEY = 'route:stomp';

/**
 * Marks a method as a STOMP endpoint at the given path.
 *
 * Implies `@socketMapping` (the connection is a WebSocket); handlers
 * receive a `SocketSession` and typically hand it to a `StompBroker`
 * (e.g. `await broker.handleSocket(session)`).
 *
 * @param route - The path to serve STOMP connections at, relative to any
 *   class-level mapping, or a full mapping configuration.
 * @returns A method decorator.
 */
export function stompMapping(route: string | RouteMappingConfiguration) {
    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        if (context.kind !== 'method') {
            throw new FrameworkError('@stompMapping is a method-only decorator.');
        }
        const name = String(context.name);
        context.metadata[`${STOMP_MAPPING_KEY}:${name}`] = true;
        // A STOMP endpoint is also a socket endpoint: the upgrade/dispatch
        // path must recognize and dispatch it.
        socketMapping(route)(target, context);
    };
}

/**
 * Whether the given method is a STOMP endpoint.
 *
 * A stomp-marked method always carries the socket markers too (the
 * `stompMapping` decorator delegates to `socketMapping`), so this is the
 * distinguishing probe for protocol negotiation — it should be consulted
 * only for methods that already `isSocketMapping`.
 *
 * @param target - The class constructor or prototype to inspect.
 * @param propertyKey - The method name.
 * @returns `true` when the method is stomp-mapped.
 */
export function isStompMapping(target: unknown, propertyKey: string | symbol): boolean {
    const metadata = getSymbolMetadata(target);
    return metadata[`${STOMP_MAPPING_KEY}:${String(propertyKey)}`] === true;
}
