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
 * `receipt` header is honored); a transport drop settles every `send()`
 * whose frame already left the wire (its receipt can never arrive on the
 * new session, COR-12) while frames still buffered go out on the new one;
 * a server ERROR is **terminal** per STOMP 1.2 §1.5 (the server closes the
 * connection just after the frame), so it rejects all outstanding sends,
 * completes every subscription stream and surfaces through the `onError`
 * observer.
 */
import { effect, signal, type Signal } from '@ndigo/signals';
import { RingBuffer } from '@ndigo/core';
import { serializeStompFrame, StompProtocolError, parseStompFrame, type StompFrame } from './stomp-frame';
import type { SocketClient } from './socket-client';
import type { StompAckMode } from './stomp-broker';
import { AsyncReader } from './async-reader';
import { bodyAsText } from './stomp-frame';

/** Default bound on sends buffered while (re)connecting (drop-oldest). */
const DEFAULT_MAX_PENDING_SENDS = 10_000;
/** Default bound on queued MESSAGE frames per subscription (drop-newest
 * while the queue is full — the transport watermark posture). */
const DEFAULT_MAX_SUBSCRIPTION_MESSAGES = 4096;
/** Default CONNECT handshake deadline in ms (see `connectTimeoutMs`). */
const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;

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
    /**
     * Whether the SEND frame reached the transport. Only a frame that left
     * the wire can be stranded by a drop — its receipt can never arrive on
     * the new session (COR-12); a still-buffered frame keeps its promise.
     */
    sent: boolean;
}

/** How a CONNECT handshake ended. */
type HandshakeOutcome = 'connected' | 'aborted' | 'timeout';

/**
 * One CONNECT handshake: a deferred settled by the CONNECTED frame, by the
 * ERROR/abort paths, or by a single timeout timer. `#onOpen` awaits this
 * instead of polling the signals (RT-1).
 */
interface Handshake {
    /** The session epoch this handshake belongs to (superseded → ignored). */
    epoch: number;
    /** Settled exactly once per outcome. */
    promise: Promise<HandshakeOutcome>;
    /** Settle the deferred and clear {@link Handshake.timer}. Idempotent. */
    settle(outcome: HandshakeOutcome): void;
    /** The timeout timer; `null` once settled. */
    timer: number | NodeJS.Timeout | null;
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
    /** App sends buffered while connecting; flushed after CONNECTED — a
     * head-indexed ring (drop-oldest eviction and the flush are O(1)). */
    readonly #pendingSends: RingBuffer<{ receiptId: string; send: () => void }>;
    readonly #maxPendingSends: number;
    readonly #maxSubscriptionMessages: number;
    /** Frames possibly sent while not connected (never — guarded). */
    readonly #closedReader = new AsyncReader<void>();
    #nextReceiptId = 0;
    /** Session ended (socket closed or reconnect:false superseded). */
    #done = false;
    /**
     * Session epoch: bumped on every drop/close/fail so a superseded
     * CONNECT handshake (from a replaced connection) is ignored instead of
     * failing a newer, healthy session.
     */
    #epoch = 0;
    /** The CONNECT handshake in flight, if any (RT-1). */
    #handshake: Handshake | null = null;

    /**
     * @param socket - The underlying connection (any `SocketClient`).
     * @param options - CONNECT headers and lifecycle policy.
     */
    constructor(socket: SocketClient, options: StompClientOptions = {}) {
        this.#socket = socket;
        this.#options = options;
        this.#maxPendingSends = options.maxPendingSends ?? DEFAULT_MAX_PENDING_SENDS;
        this.#maxSubscriptionMessages = options.maxSubscriptionMessages ?? DEFAULT_MAX_SUBSCRIPTION_MESSAGES;
        // Ring capacity rounds the bound up to a power of 2; the exact
        // `maxPendingSends` is enforced by the length guard in send().
        this.#pendingSends = new RingBuffer<{ receiptId: string; send: () => void }>(this.#maxPendingSends);
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
            this.#drainPendingSends();
            for (const subscription of this.#subscriptions.values()) {
                subscription.reader.complete();
            }
            // Terminal session: drop the registry so a late `subscribe()`
            // throws instead of registering a stream that can never receive
            // frames (the entries' readers are already completed above).
            this.#subscriptions.clear();
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
                            // Never leave the pass an orphaned promise: an
                            // unexpected throw here would be an unhandled
                            // rejection (fatal under Node's default policy)
                            // and would strand the session half-open.
                            this.#onOpen().catch((error: unknown) => {
                                this.#fail(error instanceof Error ? error.message : 'stomp session error');
                            });
                        }
                    });
                }
            } else if (status === 'reconnecting') {
                this.#epoch += 1;
                this.#abortHandshake();
                this.connected.value = false;
                // COR-12: a SEND frame that left the dropped transport can
                // never be receipted by the new STOMP session, so every
                // in-flight receipt settles here — for **both** reconnect
                // policies (`reconnect: true` used to strand them and hang
                // the caller's `await send()`). Frames still buffered keep
                // their promises: they go out on the new session.
                this.#settleSentReceipts();
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
                this.#epoch += 1;
                this.#abortHandshake();
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
     * @throws {@link stomp-frame.StompProtocolError | StompProtocolError} when the session has ended
     *   (disconnect, ERROR, transport closed) — a new subscription could
     *   never receive frames.
     */
    subscribe(destination: string, opts: { id?: string; ack?: StompAckMode } = {}): StompSubscription {
        if (this.#done) {
            throw new StompProtocolError('client is closed');
        }
        const id = opts.id ?? crypto.randomUUID();
        const ack = opts.ack ?? 'auto';
        if (this.#subscriptions.has(id)) {
            // A duplicate id would silently orphan the first subscription's
            // stream (the server routes by id, so the new entry steals its
            // frames) — reject loudly instead.
            throw new Error(`duplicate subscription id: ${id}`);
        }
        // Bounded per-subscription queue: a stalled consumer must not pin
        // memory; while full, the newest frame is dropped (the transport
        // overflow posture, mirroring `maxInboundMessages`). `0` = unbounded.
        const maxQueued =
            this.#maxSubscriptionMessages === 0 ? Number.POSITIVE_INFINITY : this.#maxSubscriptionMessages;
        const reader = new AsyncReader<StompMessage>(maxQueued);
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
     * ERROR / session end. Resolving on the wire, not just on send. A
     * transport drop settles it too when the frame already left the wire —
     * the new STOMP session cannot receipt the old id (COR-12); a frame
     * buffered for the new session resolves there.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body.
     * @param headers - Extra headers (`content-type`, caller-supplied
     *   `receipt`, …). A `receipt` id a pending send already carries
     *   rejects this send with a `StompProtocolError` — reusing it would
     *   overwrite the receipt correlation and strand the first promise;
     *   the id is reusable once its RECEIPT settles.
     * @returns A promise resolving on RECEIPT.
     */
    send(destination: string, body: unknown, headers: Record<string, string> = {}): Promise<void> {
        if (this.#done) {
            // The session is over (disconnect, ERROR, transport closed): a
            // buffered frame can never be flushed or receipted — reject
            // now instead of pinning the caller's promise forever.
            const { promise, reject } = Promise.withResolvers<void>();
            reject(new StompProtocolError('client is closed'));
            return promise;
        }
        const payload: string | Uint8Array =
            typeof body === 'string'
                ? body
                : body instanceof Uint8Array
                  ? body
                  : body instanceof ArrayBuffer
                    ? new Uint8Array(body)
                    : JSON.stringify(body);
        const ownHeaders = { ...headers };
        // Namespace auto receipt ids so a caller-supplied `receipt` header
        // can never collide with a generated one (a collision would
        // overwrite the map entry and strand the first send's promise).
        const receiptId = ownHeaders['receipt'] ?? `ndigo-${this.#nextReceiptId++}-${crypto.randomUUID()}`;
        ownHeaders['receipt'] = receiptId;
        if (this.#receipts.has(receiptId)) {
            // The id already awaits its own RECEIPT: letting this send
            // overwrite the map entry would strand the first send's
            // promise (its RECEIPT resolves the newer entry). Reject the
            // newcomer instead.
            const { promise, reject } = Promise.withResolvers<void>();
            reject(new StompProtocolError('duplicate receipt id'));
            return promise;
        }
        const { promise, resolve, reject } = Promise.withResolvers<void>();
        const receipt: PendingReceipt = { resolve, reject, sent: false };
        this.#receipts.set(receiptId, receipt);
        const send = (): void => {
            // Exception-safe: a serialization fault (invalid header name/
            // value, or a destination that cannot be a header) must not
            // escape `send()` — it would strand this receipt entry and, on
            // the flush path, abort the whole queue. The frame never left
            // the wire, so settle this send alone and leave `sent` false.
            try {
                this.#sendFrame({ command: 'SEND', headers: { destination, ...ownHeaders }, body: payload });
            } catch (error) {
                this.#receipts.delete(receiptId);
                reject(error instanceof Error ? error : new StompProtocolError(String(error)));
                return;
            }
            receipt.sent = true;
        };
        if (this.connected.value) {
            send();
        } else if (this.#maxPendingSends === 0) {
            // Buffering disabled — reject immediately; nothing is queued.
            this.#receipts.delete(receiptId);
            reject(new StompProtocolError('client is not connected'));
        } else {
            this.#pendingSends.put({ receiptId, send });
            if (this.#pendingSends.length > this.#maxPendingSends) {
                // Bounded buffer (drop-oldest): the evicted send's receipt
                // promise settles so no app await hangs on it.
                const evicted = this.#pendingSends.get();
                if (evicted !== undefined) {
                    const pending = this.#receipts.get(evicted.receiptId);
                    if (pending !== undefined) {
                        this.#receipts.delete(evicted.receiptId);
                        pending.reject(new StompProtocolError('send buffer overflow'));
                    }
                }
            }
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
        this.#epoch += 1;
        this.#abortHandshake();
        if (this.connected.value) {
            this.#sendFrame({ command: 'DISCONNECT', headers: {}, body: '' });
        }
        this.connected.value = false;
        this.#settleReceipts(new StompProtocolError('client disconnected'));
        for (const subscription of this.#subscriptions.values()) {
            subscription.reader.complete();
        }
        this.#subscriptions.clear();
        this.#drainPendingSends();
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
     * Start a CONNECT handshake: one deferred plus one timeout timer. The
     * deferred is settled by the CONNECTED frame, by an ERROR/`#fail`, by a
     * transport drop or close (the status watcher), or by the timer — the
     * awaiting `#onOpen` never polls the signals (RT-1). Every exit path
     * clears the timer so a settled handshake leaves nothing scheduled.
     *
     * @returns The handshake `#onOpen` awaits.
     */
    #beginHandshake(): Handshake {
        // A new CONNECT supersedes any handshake still in flight (a drop and
        // reopen can both queue a pass inside one epoch): the stale one
        // settles `aborted` and its timer is cleared, so it can never fail
        // the session it no longer owns.
        this.#abortHandshake();
        const { promise, resolve } = Promise.withResolvers<HandshakeOutcome>();
        const handshake: Handshake = {
            epoch: this.#epoch,
            promise,
            timer: null,
            settle: (outcome) => {
                if (handshake.timer !== null) {
                    clearTimeout(handshake.timer);
                    handshake.timer = null;
                }
                resolve(outcome);
            },
        };
        handshake.timer = setTimeout(() => {
            handshake.timer = null;
            handshake.settle('timeout');
        }, this.#options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS);
        this.#handshake = handshake;
        return handshake;
    }

    /**
     * Abort the handshake in flight (drop, ERROR, deliberate teardown, or a
     * newer CONNECT): its deferred settles `aborted` and its timer is
     * cleared, so a stale session neither waits out the deadline nor fails a
     * newer one.
     */
    #abortHandshake(): void {
        const handshake = this.#handshake;
        if (handshake !== null) {
            this.#handshake = null;
            handshake.settle('aborted');
        }
    }

    /**
     * A transport `open`: send CONNECT, await the handshake resolver, then
     * re-SUBSCRIBE active subscriptions and flush buffered sends.
     */
    async #onOpen(): Promise<void> {
        if (this.#done || this.#socket.status.value !== 'open') {
            // The status flipped again before this queued pass ran (a fast
            // drop, or a deliberate close): never CONNECT a dead transport.
            return;
        }
        const handshake = this.#beginHandshake();
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
        // Await the deferred (RT-1): settled by the CONNECTED frame, by an
        // ERROR/#fail, by a transport drop/close (the status watcher), or
        // by the handshake's single timeout timer — no signal polling.
        const outcome = await handshake.promise;
        if (this.#handshake === handshake) {
            this.#handshake = null;
        }
        if (handshake.epoch !== this.#epoch || this.#done) {
            // A newer session epoch superseded this handshake (a drop
            // followed by a fast reconnect, or #fail) — stop without
            // failing the live session.
            return;
        }
        if (outcome === 'timeout') {
            // No CONNECTED before the deadline — surface and give up.
            this.#fail('CONNECT timed out');
            return;
        }
        if (outcome !== 'connected') {
            return; // transport dropped/ERRORed before the handshake finished
        }
        // Re-SUBSCRIBE every pending subscription (same ids, same readers).
        // Entries subscribed while this connection was live are already
        // `live` and skipped — no duplicates.
        for (const [id, entry] of this.#subscriptions) {
            if (entry.state !== 'pending') {
                continue;
            }
            try {
                this.#submit(entry, id);
            } catch {
                // The SUBSCRIBE cannot be framed (e.g. an invalid
                // destination): the subscription is unusable — complete its
                // reader so no app iterator hangs, and drop it.
                this.#subscriptions.delete(id);
                entry.reader.complete();
            }
        }
        // Flush sends that arrived while (re)connecting. Per-item fault
        // isolation: one failing send must never abort the rest of the
        // queue (each `send()` already settles its own receipt, but a
        // throw from anything else is caught here and settles that entry).
        while (this.#pendingSends.length > 0) {
            const pending = this.#pendingSends.get() as { receiptId: string; send: () => void };
            try {
                pending.send();
            } catch (error) {
                const receipt = this.#receipts.get(pending.receiptId);
                if (receipt !== undefined) {
                    this.#receipts.delete(pending.receiptId);
                    receipt.reject(error instanceof Error ? error : new StompProtocolError(String(error)));
                }
            }
        }
    }

    /**
     * Route one parsed frame.
     *
     * ERROR is terminal (decision D-A): STOMP 1.2 §1.5 requires the server
     * to close the connection just after an ERROR frame, so the client ends
     * the session on the frame instead of waiting for the socket to follow.
     *
     * @param frame - The parsed frame.
     */
    #handle(frame: StompFrame): void {
        switch (frame.command) {
            case 'CONNECTED':
                this.connected.value = true;
                // Settle the handshake deferred (RT-1): the awaiting #onOpen
                // resumes on the microtask queue to re-SUBSCRIBE + flush.
                this.#handshake?.settle('connected');
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
     * Fail the STOMP session: reject outstanding receipts, abort a
     * handshake in flight, report through the observer. The socket may or
     * may not be closing — the caller (or the server's ERROR+close, §1.5)
     * owns transport teardown.
     *
     * @param message - The failure detail.
     */
    #fail(message: string): void {
        this.#done = true;
        this.#epoch += 1;
        this.#abortHandshake();
        this.connected.value = false;
        this.#settleReceipts(new StompProtocolError(message));
        this.#drainPendingSends();
        // Fail closed: end the subscription streams and the closed reader
        // so no app iterator hangs on a dead session. (The broker closes
        // the transport after ERROR; a CONNECT timeout against a live
        // transport leaves the socket open — the app observes the closed
        // streams and owns teardown.)
        for (const subscription of this.#subscriptions.values()) {
            subscription.reader.complete();
        }
        this.#subscriptions.clear();
        this.#closedReader.complete();
        try {
            this.#options.onError?.(message);
        } catch {
            // Observer faults must never break the client.
        }
    }

    /**
     * Drop every buffered send (their frames were never flushed). Used on
     * session end; the sends' receipt promises were already settled by the
     * caller — this only releases the closures.
     */
    #drainPendingSends(): void {
        while (this.#pendingSends.length > 0) {
            this.#pendingSends.get();
        }
    }

    /**
     * Reject every outstanding receipt promise — the terminal paths (ERROR,
     * deliberate teardown, socket `closed`, `reconnect: false` drop), where
     * no frame can ever be receipted.
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
     * Reject the receipts of sends whose SEND frame already left the
     * transport (COR-12): the dropped STOMP session can never receipt them
     * and the new one never sees the old ids. Frames still buffered for the
     * new session are left alone — their promises settle there.
     */
    #settleSentReceipts(): void {
        for (const [receiptId, pending] of this.#receipts) {
            if (!pending.sent) {
                continue;
            }
            this.#receipts.delete(receiptId);
            pending.reject(new StompProtocolError('connection closed'));
        }
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
