/**
 * Transport-neutral live socket fan-out contract.
 * @module ndigo-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
/** Cross-node live socket fan-out. No persistence, replay, or queue distribution. */
export type SocketFanoutScope = 'path' | 'room' | 'topic';

/** Already serialized wire payload; topic headers are application headers only. */
export interface SocketFanoutMessage {
    key: string;
    body: string | Uint8Array;
    headers?: Record<string, string>;
}

/**
 * Optional application-owned transport. Subscription completion is readiness.
 * publish resolves after backend acceptance, not client delivery. It excludes
 * the publishing transport's subscriptions: consumers deliver locally once.
 * Consumers must unsubscribe before the application closes the transport.
 */
export interface SocketFanout {
    subscribe(scope: SocketFanoutScope, receive: (message: SocketFanoutMessage) => void): Promise<() => Promise<void>>;
    publish(scope: SocketFanoutScope, message: SocketFanoutMessage): Promise<void>;
}
