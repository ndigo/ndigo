/**
 * Transport-neutral live socket fan-out contract.
 */
/** Cross-node live socket fan-out. No persistence, replay, or queue distribution. */
export type SocketFanoutScope = 'path' | 'room' | 'topic';

/** Already serialized wire payload; topic headers are application headers only. */
export interface SocketFanoutMessage {
    /** Destination key (path, room, or topic). */
    key: string;
    /** Serialized wire payload. */
    body: string | Uint8Array;
    /** Application headers; not transport framing. */
    headers?: Record<string, string>;
}

/**
 * Optional application-owned transport. Subscription completion is readiness.
 * publish resolves after backend acceptance, not client delivery. It excludes
 * the publishing transport's subscriptions: consumers deliver locally once.
 * Consumers must unsubscribe before the application closes the transport.
 */
export interface SocketFanout {
    /**
     * Subscribes to a scope's messages; completion signals readiness.
     *
     * @param scope - The fan-out scope to subscribe to.
     * @param receive - Invoked for each published message.
     * @returns An unsubscribe function.
     */
    subscribe(scope: SocketFanoutScope, receive: (message: SocketFanoutMessage) => void): Promise<() => Promise<void>>;
    /**
     * Publishes one message after backend acceptance.
     *
     * @param scope - The fan-out scope to publish to.
     * @param message - The message to publish.
     * @returns A promise that resolves after backend acceptance.
     */
    publish(scope: SocketFanoutScope, message: SocketFanoutMessage): Promise<void>;
}
