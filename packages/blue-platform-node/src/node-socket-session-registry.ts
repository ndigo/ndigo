/**
 * Node WebSocket session registry — tracks live connections, rooms, broadcast.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { SocketSession, SocketSessionRegistry } from '@blue/dispatcher';
import type { WebSocket } from 'ws';
import { assertCloseFrame } from './node-socket-session';

/**
 * Server-side fan-out backpressure policy — the slow-consumer guard
 * (Spring `bufferSizeLimit` shape).
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
     * Spring's `SESSION_NOT_RELIABLE`): bounded memory, an explicit
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
 * Options for {@link NodeSocketSessionRegistry}.
 */
export interface NodeSocketSessionRegistryOptions {
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
 * - `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS` — ping interval; `0` disables the
 *   heartbeat (D6), default `30000`.
 * - `BLUE_SOCKET_IDLE_TIMEOUT_MS` — silent-session reap threshold,
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
    const heartbeatRaw = env['BLUE_SOCKET_HEARTBEAT_INTERVAL_MS'];
    const idleRaw = env['BLUE_SOCKET_IDLE_TIMEOUT_MS'];
    const options: NodeSocketSessionRegistryOptions = {};
    if (heartbeatRaw !== undefined && heartbeatRaw !== '') {
        if (!/^\d+$/.test(heartbeatRaw)) {
            throw new RangeError(
                `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS must be a non-negative integer (ms), got: ${heartbeatRaw}`
            );
        }
        const value = Number(heartbeatRaw);
        // `0` explicitly disables the heartbeat (D6).
        options.heartbeatIntervalMs = value === 0 ? null : value;
    }
    if (idleRaw !== undefined && idleRaw !== '') {
        if (!/^\d+$/.test(idleRaw) || Number(idleRaw) === 0) {
            throw new RangeError(`BLUE_SOCKET_IDLE_TIMEOUT_MS must be a positive integer (ms), got: ${idleRaw}`);
        }
        options.idleTimeoutMs = Number(idleRaw);
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
    #heartbeatIntervalMs: number | null;
    #idleTimeoutMs: number;
    #now: () => number;
    #timer: NodeJS.Timeout | null = null;
    /** Sessions already asked to close on overflow — skip re-firing while CLOSING. */
    #overflowClosed: Set<SocketSession> = new Set();

    /**
     * @param options - Heartbeat/backpressure knobs and clock.
     */
    constructor(options: NodeSocketSessionRegistryOptions = {}) {
        // `0` disables the heartbeat, matching `resolveSocketRegistryOptions`
        // (env `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS=0` → null). Treating 0 as
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
        if (options.onOverflow) {
            this.#onOverflow.add(options.onOverflow);
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
        if (this.#sessions.has(session)) {
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
     * Strings are sent as text frames; any other value is JSON-encoded
     * (parity with `SocketSession.send`). Best-effort fan-out: closed
     * sessions are skipped and transport write errors are tolerated
     * (AD-21 D5).
     *
     * @param path - The routing path (e.g. `/ws/room`).
     * @param payload - The payload to send.
     */
    broadcast(path: string, payload: unknown): void {
        const members = this.#paths.get(path);
        if (!members) {
            return;
        }
        // Serialize once per broadcast, not once per member (each session
        // would re-`JSON.stringify` the same payload).
        const wire = typeof payload === 'string' ? payload : (JSON.stringify(payload) ?? '');
        for (const session of members) {
            this.#safeSend(session, wire);
        }
    }

    /**
     * Send a payload to every session in the named room
     * (`session.join(room)` — AD-21 D5).
     *
     * @param room - The room name.
     * @param payload - The payload to send.
     */
    broadcastTo(room: string, payload: unknown): void {
        const members = this.#rooms.get(room);
        if (!members) {
            return;
        }
        const wire = typeof payload === 'string' ? payload : (JSON.stringify(payload) ?? '');
        for (const session of members) {
            this.#safeSend(session, wire);
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
     * @param closeCode - WebSocket close status code when known — surfaced
     *   for observability (e.g. backpressure closes carry `1013`).
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
        if (this.#heartbeatIntervalMs === null || this.#timer !== null) {
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
                    observer(event);
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
}
