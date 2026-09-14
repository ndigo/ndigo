/**
 * The shared Server-Sent Event wire envelope (AD-9 naming cleanup).
 * * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
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
