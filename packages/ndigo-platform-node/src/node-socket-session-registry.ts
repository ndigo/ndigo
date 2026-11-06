/**
 * Node WebSocket session registry — tracks live connections, rooms, broadcast.
 */
import type { SocketSession, SocketSessionRegistry } from '@ndigo/dispatcher';
import type { SocketFanout } from '@ndigo/socket';
import type { WebSocket } from 'ws';
import { assertCloseFrame } from './node-socket-session';
import { readIntEnv } from './read-int-env';

/**
 * Server-side fan-out backpressure policy — the slow-consumer guard
 * (the `bufferSizeLimit` shape).
 *
 * A peer that stops reading (stalled tab, throttled network) accumulates
 * buffered frames in its transport buffer (`ws` `bufferedAmount`). Without a
 * watermark, the memory cost of a room is set by its slowest member.
 */
export type SocketBackpressurePolicy = {
    /**
     * Buffer watermark in bytes. A session whose transport has **more than
     * this many bytes queued is handled per `onOverflow`. Default
     * `1_048_576` (1 MiB).
     */
    maxBufferedBytes: number;
    /**
     * `close` (default) — close the session with `1013` ("try again later",
     * the `SESSION_NOT_RELIABLE` convention): bounded memory, an explicit
     * client-visible signal — the AD-22 client reconnects automatically.
     * `drop` — silently skip fan-out to that session (ordered gaps for that
     * consumer only).
     */
    onOverflow: 'close' | 'drop';
};

/** Default policy: 1 MiB watermark, close on overflow (fail-closed, AD-21 D6). */
const DEFAULT_BACKPRESSURE: SocketBackpressurePolicy = Object.freeze({
    maxBufferedBytes: 1_048_576,
    onOverflow: 'close',
});

/**
 * Backpressure enforcement event — the decision-point seam for telemetry
 * and logging (the private `#safeSend` decision is otherwise unobservable).
 */
export type SocketBackpressureEvent = {
    /** Endpoint path the session belongs to (auto-join set key). */
    path: string;
    /** What the policy did: `close` (`1013`) or `drop` (silent skip). */
    action: 'close' | 'drop';
    /** Transport bytes queued at the decision point. */
    bufferedBytes: number;
};

/**
 * Fan-out event — emitted once per `broadcast`/`broadcastTo` that reached at
 * least one session, after the payload has been serialized for the wire
 * (exactly once). Telemetry and logging consume this instead of
 * re-serializing the payload to measure it — the same payload would
 * otherwise be JSON-encoded twice per broadcast. A fan-out to an empty
 * path/room (or one whose members have all closed) sends nothing and emits
 * nothing.
 */
export type SocketFanoutEvent = {
    /** Which index fanned out: the endpoint path or a named room. */
    scope: 'path' | 'room';
    /** The path or room name that was targeted. */
    key: string;
    /** Wire size of the serialized payload (UTF-8 octets for text frames,
     * raw length for binary). */
    bytes: number;
    /** Sessions the payload was handed to (closed ones excluded). */
    recipients: number;
};

/**
 * Options for {@link NodeSocketSessionRegistry}.
 */
export interface NodeSocketSessionRegistryOptions {
    /** Application-owned cross-node transport. Await {@link NodeSocketSessionRegistry.connect} before publishing. */
    fanout?: SocketFanout;
    /**
     * Heartbeat ping interval in milliseconds: the registry pings every open
     * session on this cadence and reaps sessions whose pong is missing past
     * `idleTimeoutMs`. `null` disables the heartbeat (AD-21 D6 — enabled by
     * default at 30s).
     */
    heartbeatIntervalMs?: number | null;
    /**
     * A session is considered dead when no pong (or any traffic) has been
     * seen for this many milliseconds. Default `60_000` (~2 missed pongs).
     */
    idleTimeoutMs?: number;
    /**
     * Backpressure policy (default: 1 MiB watermark, `close` on overflow).
     * `null` disables the guard entirely — the transport's own buffering
     * remains the final backstop.
     */
    backpressure?: SocketBackpressurePolicy | null;
    /**
     * Observer invoked at each backpressure decision (close or drop), with
     * the path, action, and queued bytes. Constructor-only, like the policy
     * itself — the seam for telemetry/logging of the otherwise-private
     * decision point.
     */
    onOverflow?: (event: SocketBackpressureEvent) => void;
    /**
     * Injectable clock for deterministic tests (the TaskScheduler clock
     * precedent, AD-20). Defaults to `Date.now`.
     * @internal
     */
    now?: () => number;
}

/**
 * Validates and resolves socket registry options from the environment,
 * filling defaults (mirrors `resolveHTTPRequestLimits`).
 *
 * - `NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS` — ping interval; `0` disables the
 *   heartbeat (D6), default `30000`.
 * - `NDIGO_SOCKET_IDLE_TIMEOUT_MS` — silent-session reap threshold,
 *   default `60000`.
 *
 * Invalid values throw a `RangeError` (fail fast at boot).
 *
 * @param env - Environment to read (defaults to `process.env`).
 * @returns Resolved registry options.
 */
export function resolveSocketRegistryOptions(
    env: Readonly<Record<string, string | undefined>> = process.env
): NodeSocketSessionRegistryOptions {
    const options: NodeSocketSessionRegistryOptions = {};
    const heartbeat = readIntEnv(env, 'NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS', { allowZero: true });
    if (heartbeat !== undefined) {
        // `0` explicitly disables the heartbeat (D6).
        options.heartbeatIntervalMs = heartbeat === 0 ? null : heartbeat;
    }
    const idle = readIntEnv(env, 'NDIGO_SOCKET_IDLE_TIMEOUT_MS');
    if (idle !== undefined) {
        options.idleTimeoutMs = idle;
    }
    return options;
}

/**
 * Tracks live Node WebSocket sessions and fans out to them (AD-21 D3/D5/D6).
 *
 * Sessions are registered by the server adapter on connection and removed on
 * close. Every session auto-joins the set keyed by its endpoint path, so
 * `broadcast('/ws/room', …)` reaches all open sessions at that path with zero
 * setup; named rooms via `SocketSession.join`/`leave` provide finer grouping.
 * The implementation is registered as a context bean by
 * `NodeAutoConfiguration`; any service can inject it and push to a room.
 */
export class NodeSocketSessionRegistry implements SocketSessionRegistry {
    #sessions: Map<SocketSession, string> = new Map();
    /** Auto-join path index: path → sessions (mirror of `#sessions`, O(n)→O(set-size)). */
    #paths: Map<string, Set<SocketSession>> = new Map();
    #rooms: Map<string, Set<SocketSession>> = new Map();
    #transports: WeakMap<SocketSession, WebSocket> = new WeakMap();
    #lastSeen: WeakMap<SocketSession, number> = new WeakMap();
    readonly #backpressure: SocketBackpressurePolicy | null;
    #onOverflow: Set<(event: SocketBackpressureEvent) => void> = new Set();
    #onFanout: Set<(event: SocketFanoutEvent) => void> = new Set();
    #heartbeatIntervalMs: number | null;
    #idleTimeoutMs: number;
    #now: () => number;
    #timer: NodeJS.Timeout | null = null;
    /** Sessions already asked to close on overflow — skip re-firing while CLOSING. */
    #overflowClosed: Set<SocketSession> = new Set();
    readonly #fanout: SocketFanout | undefined;
    #connectPromise: Promise<void> | undefined;
    #closePromise: Promise<void> | undefined;
    #connected = false;
    #closed = false;
    #unsubscribe: Array<() => Promise<void>> = [];

    /**
     * @param options - Heartbeat/backpressure knobs and clock.
     */
    constructor(options: NodeSocketSessionRegistryOptions = {}) {
        // `0` disables the heartbeat, matching `resolveSocketRegistryOptions`
        // (env `NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS=0` → null). Treating 0 as
        // a real interval would spin a busy `setInterval(fn, 0)`; an
        // explicit `null` must also disable (not fall through `??` to the
        // default).
        this.#heartbeatIntervalMs =
            options.heartbeatIntervalMs === 0 || options.heartbeatIntervalMs === null
                ? null
                : (options.heartbeatIntervalMs ?? 30_000);
        this.#idleTimeoutMs = options.idleTimeoutMs ?? 60_000;
        this.#now = options.now ?? Date.now;
        this.#backpressure = options.backpressure === undefined ? DEFAULT_BACKPRESSURE : options.backpressure;
        this.#fanout = options.fanout;
        if (options.onOverflow) {
            this.#onOverflow.add(options.onOverflow);
        }
    }

    /**
     * Subscribe both registry scopes once. With a configured transport, callers
     * must await this before publishing. A failed connection rolls back partial
     * subscriptions and remains observable on subsequent connect calls.
     */
    connect(): Promise<void> {
        if (this.#closed) {
            return Promise.reject(new Error('Socket session registry is closed'));
        }
        return (this.#connectPromise ??= Promise.resolve().then(() => this.#connect()));
    }

    async #connect(): Promise<void> {
        if (this.#closed) {
            throw new Error('Socket session registry is closed');
        }
        if (!this.#fanout) {
            return;
        }
        try {
            const unsubscribePath = await this.#fanout.subscribe('path', (message) => {
                if (this.#connected && !this.#closed) {
                    this.#deliver('path', message.key, message.body);
                }
            });
            this.#unsubscribe.push(unsubscribePath);
            if (this.#closed) {
                throw new Error('Socket session registry is closed');
            }
            const unsubscribeRoom = await this.#fanout.subscribe('room', (message) => {
                if (this.#connected && !this.#closed) {
                    this.#deliver('room', message.key, message.body);
                }
            });
            this.#unsubscribe.push(unsubscribeRoom);
            if (this.#closed) {
                throw new Error('Socket session registry is closed');
            }
            this.#connected = true;
        } catch (error) {
            try {
                await this.#unsubscribeAll();
            } catch (cleanupError) {
                throw new AggregateError([error, cleanupError], 'Socket fanout connection and rollback failed', {
                    cause: cleanupError,
                });
            }
            throw error;
        }
    }

    /** Release registry subscriptions and heartbeat, not the application-owned transport. */
    close(): Promise<void> {
        if (this.#closePromise) {
            return this.#closePromise;
        }
        this.#closed = true;
        this.#connected = false;
        this.stop();
        return (this.#closePromise = this.#close());
    }

    async #close(): Promise<void> {
        try {
            await this.#connectPromise;
        } catch {
            // connect reports its failure and awaits partial-subscription rollback.
        }
        await this.#unsubscribeAll();
    }

    async #unsubscribeAll(): Promise<void> {
        const subscriptions = this.#unsubscribe.splice(0);
        const results = await Promise.allSettled(subscriptions.map(async (unsubscribe) => unsubscribe()));
        const errors = results.filter((result) => result.status === 'rejected').map((result) => result.reason);
        if (errors.length > 0) {
            throw new AggregateError(errors, 'Socket fanout unsubscribe failed');
        }
    }

    /**
     * Subscribe to backpressure decisions (close or drop) after construction.
     * Constructor `onOverflow` is the static seam; this is the dynamic one —
     * e.g. telemetry instrumentations that enable after the registry exists
     * (disable-time symmetry via the returned unsubscribe).
     *
     * @param observer - Invoked at each backpressure decision.
     * @returns An unsubscribe function.
     */
    addOverflowObserver(observer: (event: SocketBackpressureEvent) => void): () => void {
        this.#onOverflow.add(observer);
        return () => {
            this.#onOverflow.delete(observer);
        };
    }

    /**
     * Subscribe to fan-out events (`broadcast`/`broadcastTo`) after the
     * payload has been serialized — the size seam for telemetry, so the
     * payload is not serialized a second time just to be measured.
     *
     * @param observer - Invoked once per fan-out.
     * @returns An unsubscribe function (disable-time symmetry).
     */
    addFanoutObserver(observer: (event: SocketFanoutEvent) => void): () => void {
        this.#onFanout.add(observer);
        return () => {
            this.#onFanout.delete(observer);
        };
    }

    /**
     * Start tracking a session. Adapter hook — not part of the dispatcher
     * contract: registers the transport for heartbeat pings and attaches the
     * pong bookkeeping. The session auto-joins the set keyed by its endpoint
     * path (AD-21 D5). Idempotent.
     *
     * @param session - The session to track.
     * @param path - The endpoint path the session was upgraded at.
     * @param transport - The underlying `ws` connection (for pings and
     *   graceful reaping).
     */
    register(session: SocketSession, path: string, transport: WebSocket): void {
        if (this.#sessions.has(session) || session.isClosed) {
            return;
        }
        this.#sessions.set(session, path);
        this.#transports.set(session, transport);
        this.#lastSeen.set(session, this.#now());
        // Maintain the auto-join path index (broadcast/sessions/count read it).
        let pathMembers = this.#paths.get(path);
        if (!pathMembers) {
            pathMembers = new Set();
            this.#paths.set(path, pathMembers);
        }
        pathMembers.add(session);
        // Pongs refresh liveness; so does any inbound traffic (the option
        // docs promise "no pong (or any traffic)" semantics).
        transport.on('pong', () => this.#lastSeen.set(session, this.#now()));
        transport.on('message', () => this.#lastSeen.set(session, this.#now()));
        this.#ensureHeartbeat();
    }

    /**
     * Sessions open at the given endpoint path (auto-join set, D5).
     *
     * @param path - The routing path (e.g. `/ws/room`).
     * @returns The matching open sessions.
     */
    sessions(path: string): readonly SocketSession[] {
        return [...(this.#paths.get(path) ?? [])];
    }

    /**
     * Number of open sessions at the given endpoint path.
     *
     * @param path - The routing path.
     * @returns The session count.
     */
    count(path: string): number {
        return this.#paths.get(path)?.size ?? 0;
    }

    /**
     * Send a payload to every open session at the given endpoint path.
     *
     * Strings are sent as text frames, `Uint8Array`/`ArrayBuffer` as binary
     * frames, any other value is JSON-encoded — parity with
     * `SocketSession.send` (AD-23 D8). Best-effort fan-out: closed sessions
     * are skipped and transport write errors are tolerated (AD-21 D5).
     * Serialized once per fan-out; observers registered via
     * {@link addFanoutObserver} see the wire size without re-serializing.
     *
     * @param path - The routing path (e.g. `/ws/room`).
     * @param payload - The payload to send.
     * @returns Transport acceptance followed by best-effort local delivery.
     */
    async broadcast(path: string, payload: unknown): Promise<void> {
        this.#assertPublishing();
        if (!this.#fanout && !this.#paths.has(path)) {
            return;
        }
        const wire = serializeFanout(payload);
        if (this.#fanout) {
            await this.#fanout.publish('path', {
                key: path,
                body: wire instanceof ArrayBuffer ? new Uint8Array(wire) : wire,
            });
        }
        if (!this.#closed) {
            this.#deliver('path', path, wire);
        }
    }

    /**
     * Send a payload to every session in the named room
     * (`session.join(room)` — AD-21 D5).
     *
     * @param room - The room name.
     * @param payload - The payload to send.
     * @returns Transport acceptance followed by best-effort local delivery.
     */
    async broadcastTo(room: string, payload: unknown): Promise<void> {
        this.#assertPublishing();
        if (!this.#fanout && !this.#rooms.has(room)) {
            return;
        }
        const wire = serializeFanout(payload);
        if (this.#fanout) {
            await this.#fanout.publish('room', {
                key: room,
                body: wire instanceof ArrayBuffer ? new Uint8Array(wire) : wire,
            });
        }
        if (!this.#closed) {
            this.#deliver('room', room, wire);
        }
    }

    #assertPublishing(): void {
        if (this.#closed) {
            throw new Error('Socket session registry is closed');
        }
        if (this.#fanout && !this.#connected) {
            throw new Error('Await Socket session registry connect() before publishing');
        }
    }

    #deliver(scope: 'path' | 'room', key: string, wire: string | Uint8Array | ArrayBuffer): void {
        const members = (scope === 'path' ? this.#paths : this.#rooms).get(key);
        if (!members) {
            return;
        }
        let recipients = 0;
        for (const session of members) {
            if (session.isClosed) {
                continue;
            }
            recipients += 1;
            this.#safeSend(session, wire);
        }
        if (recipients > 0) {
            this.#emitFanout({ scope, key, bytes: fanoutBytes(wire), recipients });
        }
    }

    /**
     * Add a session to a named room.
     *
     * @param session - The session to add.
     * @param room - The room name — must be a non-empty string.
     */
    join(session: SocketSession, room: string): void {
        this.#assertRoom(room);
        let members = this.#rooms.get(room);
        if (!members) {
            members = new Set();
            this.#rooms.set(room, members);
        }
        members.add(session);
    }

    /**
     * Remove a session from a named room. Prunes empty rooms.
     *
     * @param session - The session to remove.
     * @param room - The room name — must be a non-empty string.
     */
    leave(session: SocketSession, room: string): void {
        this.#assertRoom(room);
        const members = this.#rooms.get(room);
        if (!members) {
            return;
        }
        members.delete(session);
        if (members.size === 0) {
            this.#rooms.delete(room);
        }
    }

    /**
     * Close every open session (default `1001` going away). Removal happens
     * through each connection's close event.
     *
     * Invalid close frames throw a `RangeError` before any session is
     * touched; the fan-out itself is best-effort — one session whose
     * transport rejects the close mid-handshake cannot abort the loop.
     *
     * @param code - Close status code (default `1001`).
     * @param reason - Human-readable close reason.
     */
    closeAll(code: number = 1001, reason: string = 'server shutting down'): void {
        assertCloseFrame(code, reason);
        for (const session of this.#sessions.keys()) {
            try {
                session.close(code, reason);
            } catch {
                // Best-effort: a session that refuses the close (e.g. its
                // transport is already CLOSING) must not abort the sweep.
            }
        }
    }

    /**
     * Drop a session from the registry. Idempotent; called by the
     * transport on connection close (peer or server initiated). Also stops
     * the heartbeat sweep when the last session goes away.
     *
     * @param session - The session to remove.
     * @param closeCode - WebSocket close status code when known (e.g.
     *   backpressure closes carry `1013`). The registry itself does not
     *   consume it — it is the observability seam for registry wrappers
     *   (the socket telemetry instrumentation reads it for close-code
     *   counters and session-span attributes).
     */
    remove(session: SocketSession, closeCode?: number): void {
        void closeCode;
        const path = this.#sessions.get(session);
        if (path === undefined) {
            return;
        }
        this.#sessions.delete(session);
        this.#overflowClosed.delete(session);
        // Drop the session from the auto-join path index, pruning empty sets.
        const pathMembers = this.#paths.get(path);
        if (pathMembers !== undefined) {
            pathMembers.delete(session);
            if (pathMembers.size === 0) {
                this.#paths.delete(path);
            }
        }
        for (const [room, members] of this.#rooms) {
            if (members.delete(session) && members.size === 0) {
                this.#rooms.delete(room);
            }
        }
        this.#maybeStopHeartbeat();
    }

    /**
     * Stop the heartbeat sweep. Idempotent; called on server close so no
     * timers outlive the context (graceful shutdown).
     */
    stop(): void {
        if (this.#timer !== null) {
            clearInterval(this.#timer);
            this.#timer = null;
        }
    }

    #ensureHeartbeat(): void {
        if (this.#closed || this.#heartbeatIntervalMs === null || this.#timer !== null) {
            return;
        }
        this.#timer = setInterval(() => this.#sweep(), this.#heartbeatIntervalMs);
    }

    #maybeStopHeartbeat(): void {
        if (this.#timer !== null && this.#sessions.size === 0) {
            this.stop();
        }
    }

    #sweep(): void {
        const now = this.#now();
        for (const session of this.#sessions.keys()) {
            const transport = this.#transports.get(session);
            // Probe liveness on the cadence: a healthy peer auto-pongs
            // (RFC 6455 requires a pong in reply to a ping), refreshing
            // `#lastSeen`. Ping before the staleness check so a session is
            // only judged against traffic since the previous sweep.
            transport?.ping();
            const lastSeen = this.#lastSeen.get(session);
            if (lastSeen !== undefined && now - lastSeen >= this.#idleTimeoutMs) {
                // `close(1001, …)` is a graceful close frame — the peer sees
                // 1001, matching the documented reap behavior. Peers that
                // never finish the handshake are force-reaped by ws's own
                // `closeTimeout` (default 30s); the eventual close event
                // drops the session from the registry.
                transport?.close(1001, 'session idle');
            }
        }
    }

    #safeSend(session: SocketSession, payload: unknown): void {
        if (session.isClosed) {
            return;
        }
        const policy = this.#backpressure;
        if (policy !== null) {
            const transport = this.#transports.get(session);
            if (transport !== undefined && transport.bufferedAmount > policy.maxBufferedBytes) {
                // Already asked to close on overflow: this session's decision
                // was made and memoized — skip observers and re-close while
                // the handshake is pending (~ws closeTimeout).
                if (policy.onOverflow === 'close' && this.#overflowClosed.has(session)) {
                    return;
                }
                const event: SocketBackpressureEvent = {
                    path: this.#sessions.get(session) ?? '',
                    action: policy.onOverflow,
                    bufferedBytes: transport.bufferedAmount,
                };
                for (const observer of this.#onOverflow) {
                    try {
                        observer(event);
                    } catch {
                        // An observer fault (telemetry, logging) must not
                        // abort the fan-out or skip the overflow decision —
                        // the send below is already the guarded path.
                    }
                }
                if (policy.onOverflow === 'close') {
                    // 1013 "try again later" — bounded memory, explicit
                    // client-visible signal; the AD-22 client reconnects
                    // with backoff. Close flows through the transport's
                    // close event → registry removal (no leaks). Memoized so
                    // broadcasts while the close handshake is pending don't
                    // re-fire the decision per message.
                    this.#overflowClosed.add(session);
                    session.close(1013, 'consumer too slow');
                }
                return;
            }
        }
        try {
            session.send(payload);
        } catch {
            // Best-effort fan-out (AD-21 D5): a transport that fails mid-send
            // (raced close, buffer overrun) must not break the broadcast.
        }
    }

    #assertRoom(room: string): void {
        if (typeof room !== 'string' || room.length === 0) {
            throw new RangeError(`invalid room name: ${String(room)}`);
        }
    }

    /**
     * Notify fan-out observers. An observer fault (telemetry, logging) must
     * not abort the fan-out — the send has already happened.
     *
     * @param event - The fan-out event.
     */
    #emitFanout(event: SocketFanoutEvent): void {
        for (const observer of this.#onFanout) {
            try {
                observer(event);
            } catch {
                // Observer faults never break a broadcast.
            }
        }
    }
}

/**
 * Serialize a fan-out payload for the wire, once: strings stay text frames,
 * `Uint8Array`/`ArrayBuffer` stay binary (parity with `SocketSession.send`),
 * anything else is JSON-encoded.
 *
 * @param payload - The payload to fan out.
 * @returns The wire form handed to every member.
 */
function serializeFanout(payload: unknown): string | Uint8Array | ArrayBuffer {
    if (typeof payload === 'string' || payload instanceof Uint8Array || payload instanceof ArrayBuffer) {
        return payload;
    }
    return JSON.stringify(payload) ?? '';
}

/**
 * Wire size of a serialized fan-out payload.
 *
 * @param wire - The serialized payload.
 * @returns The size in bytes (UTF-8 octets for text frames).
 */
function fanoutBytes(wire: string | Uint8Array | ArrayBuffer): number {
    return typeof wire === 'string' ? Buffer.byteLength(wire, 'utf-8') : wire.byteLength;
}
