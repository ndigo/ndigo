/**
 * Blue Socket — isomorphic WebSocket domain (AD-22).
 *
 * Owns the socket contracts (`SocketSession`, `SocketSessionRegistry` —
 * moved from `blue-dispatcher`, which re-exports them for handler
 * signatures) and the client story: `SocketClient`/`WebSocketClient` on
 * the WHATWG `WebSocket` global, with signal-based status and reconnect.
 * * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
export * from './socket-session';
export * from './socket-session-registry';
export * from './socket-client';
export * from './stomp-frame';
export * from './stomp-broker';
export * from './stomp-client';
export { AsyncReader } from './async-reader';
