/**
 * WebSocket session contract — the socket handler's view of a live
 * connection (AD-3 follow-up, sockets).
 *
 * Platform-neutral: the Node adapter (`@blue/platform-node`) supplies an
 * implementation backed by the `ws` library's RFC 6455 connection. Handlers
 * only depend on this interface, so socket behavior is testable and the
 * transport could be swapped.
 *
 * A socket handler is an async-iterable producer-consumer:
 *
 * ```ts
 * @socketMapping('/room')
 * async *room(session: SocketSession) {
 *     for await (const msg of session.messages) {
 *         yield { event: 'chat', data: { text: String(msg) } };
 *     }
 * }
 * ```
 *
 * @module
 * @since 1.0.0
 */

/**
 * A live WebSocket connection as seen by a socket handler.
 */
export interface SocketSession {
    /** The request path the socket was upgraded from (e.g. `/chat/room`). */
    readonly path: string;

    /**
     * Params extracted from the upgrade request via `@routeParams`
     * extractors (query/path/header values, validated with Zod as usual).
     */
    readonly params: Record<string, unknown>;

    /**
     * Inbound messages from the peer, as an async iterable.
     *
     * Each value is the raw message payload — a string for text frames, a
     * `Buffer`/`Uint8Array` for binary frames. The stream completes when the
     * peer closes the connection.
     */
    readonly messages: AsyncIterable<unknown>;

    /**
     * An async iterable that completes when the socket has closed, with the
     * close code (e.g. `1000` normal).
     */
    readonly closed: AsyncIterable<number>;

    /** `true` once the peer (or server) has closed the connection. */
    readonly isClosed: boolean;

    /**
     * Send a message to the peer. Text strings are sent as text frames; any
     * other value is JSON-encoded before sending.
     *
     * @param data - The payload to send.
     */
    send(data: unknown): void;

    /**
     * Close the connection.
     *
     * @param code - Close status code (default `1000` normal; `1008` policy,
     *   `1011` server error, …).
     * @param reason - Human-readable close reason.
     */
    close(code?: number, reason?: string): void;
}