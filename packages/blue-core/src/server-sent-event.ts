/**
 * The shared Server-Sent Event wire envelope (AD-9 naming cleanup).
 *
 * One type serves both sides of an SSE exchange: the server view normalizes
 * its pushed values into this shape, and the client-side parser produces it
 * from the wire format. Living in `blue-core` keeps it importable by both
 * `blue-platform-node` (server produce) and `blue-service` (client parse)
 * without a circular dependency.
 */

/**
 * One Server-Sent Event on the wire.
 */
export interface ServerSentEvent {
    /** Optional event id from the `id:` field (last occurrence wins). */
    id?: string;
    /** Event type from the `event:` field; defaults to `'message'`. */
    event: string;
    /**
     * The `data:` payload — JSON-parsed when possible, the raw string
     * otherwise. `undefined` when the event carried no data field.
     */
    data: unknown;
}
