/**
 * `@socketMapping` — WebSocket route mapping decorator (RFC 6455).
 *
 * Marks a controller method as a WebSocket endpoint. The method is routed by
 * path like an HTTP mapping but, instead of receiving request arguments and
 * returning a response, it receives a {@link SocketSession} and is a duplex:
 *
 * ```ts
 * @requestMapping('/chat')          // class-level prefix
 * class ChatController {
 *     @socketMapping('/room')       // WS endpoint at /chat/room
 *     async *room(session: SocketSession) {
 *         for await (const msg of session.messages) {
 *             yield { event: 'chat', data: { text: String(msg) } };
 *         }
 *     }
 * }
 * ```
 *
 * The handler is an **async-iterable producer-consumer**: it `for await`s
 * inbound messages from `session.messages` and `yield`s outbound values that
 * the platform writes to the socket. Control (params, headers, auth) is
 * expressed through the same `@parameters` extractors as HTTP handlers —
 * the upgrade request resolves them exactly like a normal request — and the
 * interceptor chain runs before the handshake, so an auth denial rejects the
 * upgrade with `401`/`403` instead of `101`.
 *
 * Semantics:
 * - A socket mapping matches its **path** regardless of HTTP method. The
 *   platform adapter performs the RFC 6455 handshake only when the request
 *   carries `Connection: Upgrade` + `Upgrade: websocket`.
 * - A plain HTTP request to a socket-mapped path is not an upgrade: it falls
 *   through to normal dispatch (404/405 for the method).
 * - Socket handlers share the metadata record with HTTP mappings, so a class
 *   can mix HTTP and WebSocket endpoints (`@chat`, `@requestMapping('/')`,
 *   `@socketMapping('/ws')`).
 *
 * @module
 * @since 1.0.0
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
