/**
 * STOMP client — CONNECT negotiation, subscriptions, receipts (D1/D2).
 *
 * `STOMPClient` wraps any {@link SocketClient} (the isomorphic
 * `WebSocketClient`) and owns the STOMP session on top of the raw
 * message stream: sends CONNECT as the first frame of every transport
 * connection, awaits CONNECTED, routes MESSAGE frames to per-subscription
 * async iterables, resolves `send()` promises on RECEIPT, and maps the
 * socket status signal onto the STOMP lifecycle.
 *
 * Reconnect semantics: a new WebSocket connection is a **new STOMP
 * session** (the server requires CONNECT first), so on every underlying
 * `open` the client re-CONNECTs and re-SUBSCRIBEs its active
 * subscriptions, then flushes app sends that arrived mid-gap. Subscribers
 * keep the same iterables across reconnects — only the delivery pauses.
 *
 * Protocol posture: heart-beat is advertised `0,0` (the WS layer
 * owns liveness); receipts auto-generated per `send()` (a caller-supplied
 * `receipt` header is honored); a transport drop settles every `send()`
 * whose frame already left the wire (its receipt can never arrive on the
 * new session) while frames still buffered go out on the new one;
 * a server ERROR is **terminal** per STOMP 1.2 §1.5 (the server closes the
 * connection just after the frame), so it rejects all outstanding sends,
 * completes every subscription stream and surfaces through the `onError`
 * observer.
 */
import { signal, type Signal } from '@ndigo/signals';
import { serializeStompFrame, STOMPProtocolError, type STOMPFrame } from './stomp-frame.js';
import type { SocketClient } from './socket-client.js';
import type { STOMPAckMode } from './stomp-broker.js';
import { AsyncReader } from './async-reader.js';
import { STOMPHandshake } from './_stomp-client-handshake.js';
import { STOMPSendTracker, type STOMPSendHost } from './_stomp-client-sends.js';
import { STOMPSubscriptionRegistry, type STOMPSubscriptionHost } from './_stomp-client-subscriptions.js';
import { drainStompFrames, type STOMPFrameRouter } from './_stomp-client-frames.js';
import { openStompSession, type STOMPConnectorHost } from './_stomp-client-connector.js';
import { watchStompStatus, type STOMPLifecycleHost } from './_stomp-client-lifecycle.js';
import { failStompSession, type STOMPFailHost } from './_stomp-client-fail.js';
import type { STOMPClientOptions, STOMPSubscription } from './stomp-client-types.js';
import { createSTOMPClientHosts } from './_stomp-client-hosts.js';

export * from './stomp-client-types.js';

/** Default bound on sends buffered while (re)connecting (drop-oldest). */
const DEFAULT_MAX_PENDING_SENDS = 10_000;
/** Default bound on queued MESSAGE frames per subscription (drop-newest
 * while the queue is full — the transport watermark posture). */
const DEFAULT_MAX_SUBSCRIPTION_MESSAGES = 4096;
/** Default CONNECT handshake deadline in ms (see `connectTimeoutMs`). */
const DEFAULT_CONNECT_TIMEOUT_MS = 10_000;

/**
 * STOMP 1.2 client over any {@link SocketClient}.
 *
 * @example
 * ```ts
 * const socket = new WebSocketClient('ws://localhost:3000/stomp/chat');
 * const stomp = new STOMPClient(socket, { host: 'localhost:3000' });
 *
 * const sub = stomp.subscribe('/topic/chat');
 * for await (const message of sub.messages) {
 *     console.log(message.json());
 * }
 * stomp.send('/topic/chat', JSON.stringify({ hello: 'world' }));
 * ```
 */
export class STOMPClient {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "STOMPClient".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object STOMPClient]"
     */
    get [Symbol.toStringTag](): string {
        return 'STOMPClient';
    }

    readonly #socket: SocketClient;
    /** Reactive STOMP-session state: connected after CONNECTED. */
    readonly connected: Signal<boolean> = signal(false);
    /** Subscriptions, receipts, and buffered sends (owned by collaborators). */
    readonly #subscriptions = new STOMPSubscriptionRegistry();
    readonly #sends: STOMPSendTracker;
    readonly #handshake: STOMPHandshake;
    readonly #subscriptionHost: STOMPSubscriptionHost;
    readonly #sendHost: STOMPSendHost;
    readonly #router: STOMPFrameRouter;
    readonly #connectorHost: STOMPConnectorHost;
    readonly #lifecycleHost: STOMPLifecycleHost;
    readonly #failHost: STOMPFailHost;
    readonly #closedReader = new AsyncReader<void>();
    /** Session ended (socket closed or reconnect:false superseded). */
    #done = false;
    /**
     * Session epoch: bumped on every drop/close/fail so a superseded
     * CONNECT handshake (from a replaced connection) is ignored instead of
     * failing a newer, healthy session.
     */
    #epoch = 0;

    /**
     * Creates a STOMP client over the given socket.
     *
     * @param socket - The underlying connection (any `SocketClient`).
     * @param options - CONNECT headers and lifecycle policy.
     */
    constructor(socket: SocketClient, options: STOMPClientOptions = {}) {
        this.#socket = socket;
        this.#sends = new STOMPSendTracker(options.maxPendingSends ?? DEFAULT_MAX_PENDING_SENDS);
        this.#handshake = new STOMPHandshake(() => options.connectTimeoutMs ?? DEFAULT_CONNECT_TIMEOUT_MS);
        const hosts = createSTOMPClientHosts({
            socket,
            options,
            connected: this.connected,
            subscriptions: this.#subscriptions,
            sends: this.#sends,
            handshake: this.#handshake,
            closedReader: this.#closedReader,
            maxSubscriptionMessages: options.maxSubscriptionMessages ?? DEFAULT_MAX_SUBSCRIPTION_MESSAGES,
            isDone: (): boolean => this.#done,
            setDone: (value): void => {
                this.#done = value;
            },
            currentEpoch: (): number => this.#epoch,
            bumpEpoch: (): void => {
                this.#epoch += 1;
            },
            onOpen: (): Promise<void> => this.#onOpen(),
            fail: (message): void => this.#fail(message),
            sendFrame: (frame): void => this.#sendFrame(frame),
        });
        this.#subscriptionHost = hosts.subscriptionHost;
        this.#sendHost = hosts.sendHost;
        this.#router = hosts.router;
        this.#connectorHost = hosts.connectorHost;
        this.#lifecycleHost = hosts.lifecycleHost;
        this.#failHost = hosts.failHost;
        // Consume the socket's message stream: parse frames, route MESSAGEs
        // to subscriptions, resolve receipts, track session state. Started
        // in the constructor so the reader's queue never grows unbounded.
        void drainStompFrames(this.#socket.messages, this.#router);
        watchStompStatus(() => this.#lifecycleHost);
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
     * @throws when the session has ended
     *   (disconnect, ERROR, transport closed) — a new subscription could
     *   never receive frames.
     */
    subscribe(destination: string, opts: { id?: string; ack?: STOMPAckMode } = {}): STOMPSubscription {
        if (this.#done) {
            throw new STOMPProtocolError('client is closed');
        }
        return this.#subscriptions.subscribe(this.#subscriptionHost, destination, opts);
    }

    /**
     * Send a message to a destination. Strings are sent as-is;
     * `Uint8Array`/`ArrayBuffer` bodies go as binary; any other
     * value is JSON-encoded — parity with `SocketClient.send`.
     *
     * The returned promise resolves when the broker RECEIPTs the frame
     * (a fresh `receipt` header is attached), or rejects on a server
     * ERROR / session end. Resolving on the wire, not just on send. A
     * transport drop settles it too when the frame already left the wire —
     * the new STOMP session cannot receipt the old id; a frame
     * buffered for the new session resolves there.
     *
     * @param destination - The destination (e.g. `/topic/chat`).
     * @param body - The message body.
     * @param headers - Extra headers (`content-type`, caller-supplied
     *   `receipt`, …). A `receipt` id a pending send already carries
     *   rejects this send with a `STOMPProtocolError` — reusing it would
     *   overwrite the receipt correlation and strand the first promise;
     *   the id is reusable once its RECEIPT settles.
     * @returns A promise resolving on RECEIPT.
     */
    send(destination: string, body: unknown, headers: Record<string, string> = {}): Promise<void> {
        return this.#sends.send(this.#sendHost, destination, body, headers);
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
        this.#handshake.abort();
        if (this.connected.value) {
            this.#sendFrame({ command: 'DISCONNECT', headers: {}, body: '' });
        }
        this.connected.value = false;
        this.#sends.settleAll(new STOMPProtocolError('client disconnected'));
        this.#subscriptions.completeAll();
        this.#sends.drainPending();
        this.#closedReader.complete();
        this.#socket.close(1000, 'stomp disconnect');
    }

    /**
     * A transport `open`: CONNECT, await CONNECTED, re-SUBSCRIBE, and flush.
     */
    async #onOpen(): Promise<void> {
        await openStompSession(() => this.#connectorHost);
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
        failStompSession(message, this.#failHost);
    }

    /**
     * Serialize + send one frame through the socket (text frame).
     *
     * @param frame - The frame to send.
     */
    #sendFrame(frame: STOMPFrame): void {
        this.#socket.send(serializeStompFrame(frame));
    }
}
