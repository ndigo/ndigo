/**
 * Public STOMP client contracts.
 */
/**
 * A MESSAGE frame delivered to a subscription. The body is the wire
 * payload verbatim — a string for text frames, bytes for binary; `json()` parses either (bytes decoded as UTF-8) on demand.
 *
 * @example
 * ```ts
 * const message: STOMPMessage = { body: 'hello', headers: {} };
 * ```
 */
export interface STOMPMessage<T = unknown> {
    /** The frame's destination. */
    readonly destination: string;
    /** The frame's `message-id` (unique per broker instance). */
    readonly messageId: string;
    /** The subscription id this frame was routed to. */
    readonly subscription: string;
    /** All frame headers (includes `destination`/`subscription`/`message-id`). */
    readonly headers: Record<string, string>;
    /** The raw message body (text or bytes, D8). */
    readonly body: string | Uint8Array;
    /** Parse the body as JSON (bytes decoded as UTF-8 first). */
    json(): T;
}

/**
 * Options for `STOMPClient`.
 *
 * @example
 * ```ts
 * const options: STOMPClientOptions = { url: 'ws://localhost:8080/ws' };
 * ```
 */
export interface STOMPClientOptions {
    /**
     * `accept-version` values offered on CONNECT (comma-separated).
     * Default `'1.2,1.1,1.0'` — the server negotiates the highest mutual.
     */
    acceptVersion?: string;
    /**
     * Value for the CONNECT `host` header (STOMP 1.1+). Defaults to the
     * socket URL's host.
     */
    host?: string;
    /** Optional `login` header on CONNECT (broker credential seam). */
    login?: string;
    /** Optional `passcode` header on CONNECT. */
    passcode?: string;
    /**
     * `heart-beat` values advertised on CONNECT. Default `'0,0'` — the
     * transport owns liveness.
     */
    heartBeat?: string;
    /**
     * Whether the STOMP session rides the socket's automatic reconnects
     * (re-CONNECT + re-SUBSCRIBE on the next `open`). Default `true`.
     * `false` means an unexpected close ends the session.
     *
     * Either way a drop settles the receipts of sends whose frames already
     * left the transport (the new STOMP session can never receipt the old
     * ids); sends buffered for the new session keep their promises.
     */
    reconnect?: boolean;
    /**
     * Bound on sends buffered while (re)connecting. A reconnect storm with
     * an app that keeps sending would otherwise grow the buffer (and its
     * receipt promises) without limit. Overflow drops the oldest send and
     * rejects its receipt promise. Default `10000`; `0` disables buffering
     * (sends while disconnected reject immediately).
     */
    maxPendingSends?: number;
    /**
     * Bound on queued MESSAGE frames per subscription. A consumer slower
     * than the broker (hidden tab, throttled renderer) otherwise lets the
     * queue grow without limit; while full, the newest frame is dropped
     * (the transport watermark posture). Default `4096`; `0` unbounded.
     */
    maxSubscriptionMessages?: number;
    /**
     * CONNECT handshake timeout in ms: no CONNECTED frame within this
     * window ends the session (rejects outstanding sends, completes
     * subscription streams, invokes `onError`). One timer per handshake,
     * cleared as soon as the handshake settles. Default `10000`.
     */
    connectTimeoutMs?: number;
    /**
     * Error observer: invoked with the `message` header of a server ERROR
     * frame (and on protocol violations). All outstanding `send()`
     * promises reject with a `STOMPProtocolError` carrying the same text.
     */
    onError?: (message: string) => void;
}

/** A live subscription: an async iterable of MESSAGE frames. *
 * @example
 * ```ts
 * for await (const msg of subscription) console.log(msg.body);
 * ```
 */
export interface STOMPSubscription {
    /** The client-chosen subscription id (server-echoed on MESSAGE). */
    readonly id: string;
    /** The destination this subscription is bound to. */
    readonly destination: string;
    /** Delivered MESSAGE frames, in order. Stalls across reconnects. */
    readonly messages: AsyncIterable<STOMPMessage>;
    /** Send UNSUBSCRIBE + complete the stream. Idempotent. */
    unsubscribe(): void;
    /** Send an ACK frame for a delivered message (client acks, §1.4). @param messageId - The delivered message id. */
    ack(messageId: string): void;
    /** Send a NACK frame for a delivered message (§1.4). @param messageId - The delivered message id. */
    nack(messageId: string): void;
}
