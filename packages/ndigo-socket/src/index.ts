/**
 * Ndigo Socket — isomorphic WebSocket domain (AD-22).
 *
 * Owns the socket contracts (`SocketSession`, `SocketSessionRegistry` —
 * moved from `ndigo-dispatcher`, which re-exports them for handler
 * signatures) and the client story: `SocketClient`/`WebSocketClient` on
 * the WHATWG `WebSocket` global, with signal-based status and reconnect.
 */
export * from './socket-session';
export * from './socket-session-registry';
export * from './socket-client';
export * from './stomp-frame';
export * from './stomp-broker';
export * from './stomp-client';
export * from './message-store';
export { AsyncReader } from './async-reader';
export * from './socket-fanout';
