/**
 * STOMP client — CONNECT negotiation, subscriptions, receipts (AD-23
 * D1/D2).
 *
 * `StompClient` wraps any {@link SocketClient} (the isomorphic
 * `WebSocketClient`, AD-22) and owns the STOMP session on top of the raw
 * message stream: sends CONNECT as the first frame of every transport
 * connection, awaits CONNECTED, routes MESSAGE frames to per-subscription
 * async iterables, resolves `send()` promises on RECEIPT, and maps the
 * socket status signal onto the STOMP lifecycle.
 *
 * Reconnect semantics (AD-23): a new WebSocket connection is a **new STOMP
 * session** (the server requires CONNECT first), so on every underlying
 * `open` the client re-CONNECTs and re-SUBSCRIBEs its active
 * subscriptions, then flushes app sends that arrived mid-gap. Subscribers
 * keep the same iterables across reconnects — only the delivery pauses.
 *
 * Protocol posture: heart-beat is advertised `0,0` (the AD-21 WS layer
 * owns liveness); receipts auto-generated per `send()` (a caller-supplied
 * `receipt` header is honored); a server ERROR rejects all outstanding
 * sends and surfaces through the `onError` observer.
 * * @module blue-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { effect, signal, type Signal } from '@blue/signals';
import { serializeStompFrame, StompProtocolError, parseStompFrame, type StompFrame } from './stomp-frame';
import type { SocketClient } from './socket-client';
import type { StompAckMode } from './stomp-broker';
import { AsyncReader } from './async-reader';
import { bodyAsText } from './stomp-frame';

/**
 * A MESSAGE frame delivered to a subscription. The body is the wire
 * payload verbatim — a string for text frames, bytes for binary (AD-23
 * D8); `json()` parses either (bytes decoded as UTF-8) on demand.
 */
export interface StompMessage<T = unknown> {
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
 * Options for {@link StompClient}.
 */
export interface StompClientOptions {
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
     * transport owns liveness (AD-23 D3).
     */
    heartBeat?: string;
    /**
     * Whether the STOMP session rides the socket's automatic reconnects
     * (re-CONNECT + re-SUBSCRIBE on the next `open`). Default `true`.
     * `false` means an unexpected close ends the session.
     */
    reconnect?: boolean;
    /**
     * Error observer: invoked with the `message` header of a server ERROR
     * frame (and on protocol violations). All outstanding `send()`
     * promises reject with a `StompProtocolError` carrying the same text.
     */
    onError?: (message: string) => void;
}

/** A live subscription: an async iterable of MESSAGE frames. */
export interface StompSubscription {
    /** The client-chosen subscription id (server-echoed on MESSAGE). */
    readonly id: string;
    /** The destination this subscription is bound to. */
    readonly destination: string;
    /** Delivered MESSAGE frames, in order. Stalls across reconnects. */
    readonly messages: AsyncIterable<StompMessage>;
    /** Send UNSUBSCRIBE + complete the stream. Idempotent. */
    unsubscribe(): void;
    /** Send an ACK frame for a delivered message (client acks, §1.4). */
    ack(messageId: string): void;
    /** Send a NACK frame for a delivered message (§1.4). */
    nack(messageId: string): void;
}

/** Pending `send()` state: resolved by the matching RECEIPT. */
interface PendingReceipt {
    resolve: () => void;
    reject: (error: Error) => void;
}

/** A registered subscription before teardown. */
interface SubscriptionEntry {
    destination: string;
    /** The requested ack mode — replayed verbatim on every SUBSCRIBE. */
    ack: StompAckMode;
    reader: AsyncReader<StompMessage>;
    /** `pending` — not yet sent on this connection; `live` — SUBSCRIBEd. */
    state: 'pending' | 'live';
}

/**
 * STOMP 1.2 client over any {@link SocketClient} (AD-23).
 *
 * @example
 * ```ts
 * const socket = new WebSocketClient('ws://localhost:3000/stomp/chat');
 * const stomp = new StompClient(socket, { host: 'localhost:3000' });
 *
 * const sub = stomp.subscribe('/topic/chat');
 * for await (const message of sub.messages) {
 *     console.log(message.json());
 * }
 * stomp.send('/topic/chat', JSON.stringify({ hello: 'world' }));
 * ```
 */
export class StompClient {
    readonly #socket: SocketClient;
    readonly #options: StompClientOptions;
    /** Reactive STOMP-session state: connected after CONNECTED. */
    readonly connected: Signal<boolean> = signal(false);
    /** Subscriptions by id (stays stable across reconnects). */
    readonly #subscriptions = new Map<string, SubscriptionEntry>();
    /** Receipt id → pending resolution. */
    readonly #receipts = new Map<string, PendingReceipt>();
    /** App sends buffered while connecting; flushed after CONNECTED. */
    readonly #pendingSends: Array<() => void> = [];
    /** Frames possibly sent while not connected (never — guarded). */
    readonly #closedReader = new AsyncReader<void>();
    #nextReceiptId = 0;
    /** Session ended (socket closed or reconnect:false superseded). */
    #done = false;

    /**
     * @param socket - The underlying connection (any `SocketClient`).
     * @param options - CONNECT headers and lifecycle policy.
     */
    constructor(socket: SocketClient, options: StompClientOptions = {}) {
        this.#socket = socket;
        this.#options = options;
        // Consume the socket's message stream: parse frames, route MESSAGEs
        // to subscriptions, resolve receipts, track session state. Started
        // in the constructor so the reader's queue never grows unbounded.
        void this.#drain();
        // Ride the socket status signal (the AD-19/reactivity idiom, not a
        // poll loop): every transport `open` is a fresh STOMP session —
        // CONNECT, then re-SUBSCRIBE, then flush.
        const sessionEnded = (): void => {
            this.connected.value = false;
            this.#settleReceipts(new StompProtocolError('connection closed'));
            this.#pendingSends.length = 0;
            for (const subscription of this.#subscriptions.values()) {
                subscription.reader.complete();
            }
            this.#closedReader.complete();
        };
        effect(() => {
            const status = this.#socket.status.value;
            if (status === 'open') {
                if (!this.#done) {
                    // Defer out of the effect's synchronous scope: #onOpen
                    // reads signals (`connected`, `socket.status`), and an
                    // in-scope read would make the effect re-run on every
                    // CONNECTED flip — a second CONNECT on the same
                    // transport. queueMicrotask detaches the reads.
                    queueMicrotask(() => {
                        if (!this.#done) {
                            void this.#onOpen();
                        }
                    });
                }
            } else if (status === 'reconnecting') {
                this.connected.value = false;
                // A new transport connection is a new STOMP session: every
                // entry must be re-SUBSCRIBEd after the next CONNECTED
                // (the #onOpen pass picks up entries still `pending`).
                for (const entry of this.#subscriptions.values()) {
                    entry.state = 'pending';
                }
                if (this.#options.reconnect === false) {
                    // The STOMP session does not ride reconnects: end it at
                    // the drop (the socket may still come back; we are done).
                    this.#done = true;
                    sessionEnded();
                }
            } else if (status === 'closed') {
                this.#done = true;
                sessionEnded();
            }
        });
    }

    /** Completes on deliberate `disconnect()` or the socket going `closed`. */
    get closed(): AsyncIterable<void> {
        return this.#closedReader.iterable();
    }

    /**
     * Subscribe to a destination.
     *
     * The returned iterable receives MESSAGE frames for this subscription
     * only (routed by the `subscription` header). It stalls across
     * reconnects — the client re-SUBSCRIBEs with the same id and delivery
     * resumes. It completes on `unsubscribe()` or session end.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param opts - Subscription policy (`id` defaults to an opaque uuid;
     *   `ack` defaults to `auto`).
     * @returns The subscription handle.
     */
    subscribe(destination: string, opts: { id?: string; ack?: StompAckMode } = {}): StompSubscription {
        const id = opts.id ?? crypto.randomUUID();
        const ack = opts.ack ?? 'auto';
        const reader = new AsyncReader<StompMessage>();
        const entry: SubscriptionEntry = { destination, ack, reader, state: 'pending' };
        this.#subscriptions.set(id, entry);
        if (this.connected.value) {
            // Connected: the SUBSCRIBE goes out now (never buffered —
            // #onOpen's re-subscribe pass only touches entries still
            // pending, so a live entry is never duplicated).
            this.#submit(entry, id);
        }
        const remove = (): void => {
            this.#subscriptions.delete(id);
            reader.complete();
        };
        return {
            id,
            destination,
            messages: reader.iterable(),
            unsubscribe: () => {
                // Remove locally first: the reader completes and the
                // re-CONNECT path skips re-SUBSCRIBing. The wire frame is
                // only valid while connected (a subscription that never
                // re-SUBSCRIBEd has no server state to release).
                remove();
                if (this.connected.value) {
                    this.#sendFrame({ command: 'UNSUBSCRIBE', headers: { id }, body: '' });
                }
            },
            ack: (messageId: string) => {
                // Acks are only meaningful for delivery on a live session;
                // MESSAGE frames never arrive while disconnected, so a
                // late ack would be a protocol violation — drop it.
                if (this.connected.value) {
                    this.#sendFrame({ command: 'ACK', headers: { id: messageId, subscription: id }, body: '' });
                }
            },
            nack: (messageId: string) => {
                if (this.connected.value) {
                    this.#sendFrame({ command: 'NACK', headers: { id: messageId, subscription: id }, body: '' });
                }
            },
        };
    }

    /**
     * Send a message to a destination. Strings are sent as-is;
     * `Uint8Array`/`ArrayBuffer` bodies go as binary (D8); any other
     * value is JSON-encoded — parity with `SocketClient.send`.
     *
     * The returned promise resolves when the broker RECEIPTs the frame
     * (a fresh `receipt` header is attached), or rejects on a server
     * ERROR / session end. Resolving on the wire, not just on send.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body.
     * @param headers - Extra headers (`content-type`, caller-supplied
     *   `receipt`, …).
     * @returns A promise resolving on RECEIPT.
     */
    send(destination: string, body: unknown, headers: Record<string, string> = {}): Promise<void> {
        const payload: string | Uint8Array =
            typeof body === 'string'
                ? body
                : body instanceof Uint8Array
                  ? body
                  : body instanceof ArrayBuffer
                    ? new Uint8Array(body)
                    : JSON.stringify(body);
        const ownHeaders = { ...headers };
        const receiptId = ownHeaders['receipt'] ?? `receipt-${this.#nextReceiptId++}`;
        ownHeaders['receipt'] = receiptId;
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        this.#receipts.set(receiptId, { resolve, reject });
        const send = (): void => {
            this.#sendFrame({ command: 'SEND', headers: { destination, ...ownHeaders }, body: payload });
        };
        if (this.connected.value) {
            send();
        } else {
            this.#pendingSends.push(send);
        }
        return promise;
    }

    /**
     * Deliberate teardown: DISCONNECT (when connected), then close the
     * underlying socket. Never reconnects, completes every subscription
     * stream, and rejects outstanding receipts.
     */
    disconnect(): void {
        if (this.#done) {
            return;
        }
        this.#done = true;
        if (this.connected.value) {
            this.#sendFrame({ command: 'DISCONNECT', headers: {}, body: '' });
        }
        this.connected.value = false;
        this.#settleReceipts(new StompProtocolError('client disconnected'));
        for (const subscription of this.#subscriptions.values()) {
            subscription.reader.complete();
        }
        this.#subscriptions.clear();
        this.#pendingSends.length = 0;
        this.#closedReader.complete();
        this.#socket.close(1000, 'stomp disconnect');
    }

    /**
     * Consume the socket's message stream and route frames. Runs for the
     * lifetime of the client; never rejects (each frame is handled
     * defensively).
     */
    async #drain(): Promise<void> {
        try {
            for await (const raw of this.#socket.messages) {
                if (typeof raw !== 'string' && !(raw instanceof Uint8Array) && !(raw instanceof ArrayBuffer)) {
                    continue; // not a frame-carrying payload
                }
                let frame: StompFrame;
                try {
                    frame = parseStompFrame(raw as string);
                } catch (error) {
                    this.#fail(error instanceof StompProtocolError ? error.message : 'malformed STOMP frame');
                    continue;
                }
                if (frame.command === '') {
                    continue; // server heart-beat ping
                }
                try {
                    this.#handle(frame);
                } catch (error) {
                    this.#fail((error as Error).message);
                }
            }
        } catch {
            // Socket stream ended (reconnecting or closed); the status
            // watcher owns the lifecycle transitions.
        }
    }

    /**
     * A transport `open`: send CONNECT, await CONNECTED, then re-SUBSCRIBE
     * active subscriptions and flush buffered sends.
     */
    async #onOpen(): Promise<void> {
        const host = this.#options.host ?? this.#socketHost();
        this.#sendFrame({
            command: 'CONNECT',
            headers: {
                'accept-version': this.#options.acceptVersion ?? '1.2,1.1,1.0',
                host,
                'heart-beat': this.#options.heartBeat ?? '0,0',
                ...(this.#options.login !== undefined ? { login: this.#options.login } : {}),
                ...(this.#options.passcode !== undefined ? { passcode: this.#options.passcode } : {}),
            },
            body: '',
        });
        // Wait for CONNECTED (or ERROR/close). Poll the signal — the
        // socket delivers frames through #drain asynchronously.
        const deadline = Date.now() + 10_000;
        while (!this.connected.value && Date.now() < deadline) {
            if (this.#socket.status.value !== 'open') {
                return; // transport dropped before the handshake finished
            }
            // eslint-disable-next-line no-await-in-loop -- each iteration re-reads the just-updated state; batching would break the exit conditions.
            await new Promise<void>((resolve) => setTimeout(resolve, 10));
        }
        if (!this.connected.value) {
            // No CONNECTED before the deadline — surface and give up.
            this.#fail('CONNECT timed out');
            return;
        }
        // Re-SUBSCRIBE every pending subscription (same ids, same readers).
        // Entries subscribed while this connection was live are already
        // `live` and skipped — no duplicates.
        for (const [id, entry] of this.#subscriptions) {
            if (entry.state === 'pending') {
                this.#submit(entry, id);
            }
        }
        // Flush sends that arrived while (re)connecting.
        const pending = this.#pendingSends.splice(0);
        for (const send of pending) {
            send();
        }
    }

    /**
     * Route one parsed frame.
     *
     * @param frame - The parsed frame.
     */
    #handle(frame: StompFrame): void {
        switch (frame.command) {
            case 'CONNECTED':
                this.connected.value = true;
                break;
            case 'MESSAGE': {
                const subscription = this.#subscriptions.get(frame.headers['subscription'] ?? '');
                if (subscription === undefined || subscription.state === 'pending') {
                    return; // unknown/resubscribe-pending subscription — dropped
                }
                subscription.reader.push({
                    destination: frame.headers['destination'] ?? '',
                    messageId: frame.headers['message-id'] ?? '',
                    subscription: frame.headers['subscription'] ?? '',
                    headers: frame.headers,
                    body: frame.body,
                    json: () => {
                        try {
                            return JSON.parse(bodyAsText(frame.body)) as unknown;
                        } catch {
                            return null;
                        }
                    },
                });
                break;
            }
            case 'RECEIPT': {
                const receiptId = frame.headers['receipt-id'];
                if (receiptId !== undefined) {
                    const pending = this.#receipts.get(receiptId);
                    if (pending !== undefined) {
                        this.#receipts.delete(receiptId);
                        pending.resolve();
                    }
                }
                break;
            }
            case 'ERROR':
                this.#fail(frame.headers['message'] ?? 'server error');
                break;
            default:
                break; // SEND/SUBSCRIBE echoes are not server->client
        }
    }

    /**
     * Fail the STOMP session: reject outstanding receipts, report through
     * the observer. The socket may or may not be closing — the caller
     * (or the server's ERROR+close) owns transport teardown.
     *
     * @param message - The failure detail.
     */
    #fail(message: string): void {
        this.connected.value = false;
        this.#settleReceipts(new StompProtocolError(message));
        try {
            this.#options.onError?.(message);
        } catch {
            // Observer faults must never break the client.
        }
    }

    /**
     * Reject every outstanding receipt promise.
     *
     * @param error - The reason.
     */
    #settleReceipts(error: Error): void {
        for (const pending of this.#receipts.values()) {
            pending.reject(error);
        }
        this.#receipts.clear();
    }

    /**
     * Register a subscription on the wire (idempotent per connection):
     * sends SUBSCRIBE (with the entry's ack mode) and flips it to `live`.
     *
     * @param entry - The subscription entry.
     * @param id - The subscription id.
     */
    #submit(entry: SubscriptionEntry, id: string): void {
        if (entry.state === 'live') {
            return;
        }
        this.#sendFrame({
            command: 'SUBSCRIBE',
            headers: { destination: entry.destination, id, ack: entry.ack },
            body: '',
        });
        entry.state = 'live';
    }

    /**
     * Serialize + send one frame through the socket (text frame).
     *
     * @param frame - The frame to send.
     */
    #sendFrame(frame: StompFrame): void {
        this.#socket.send(serializeStompFrame(frame));
    }

    /** Best-effort host derivation from the socket URL. */
    #socketHost(): string {
        try {
            return new URL(this.#socket.url).host;
        } catch {
            return 'localhost';
        }
    }
}
