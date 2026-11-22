/**
 * The shared Server-Sent Event wire envelope ( naming cleanup).
 */
/**
 * One Server-Sent Event on the wire.
 *
 * @example
 * ```ts
 * const event: ServerSentEvent = { event: 'update', data: '{"count":1}' };
 * ```
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
