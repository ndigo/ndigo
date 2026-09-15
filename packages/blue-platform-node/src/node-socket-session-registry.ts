/**
 * Node WebSocket session registry — tracks live connections, rooms, broadcast.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { SocketSession, SocketSessionRegistry } from '@blue/dispatcher';
import type { WebSocket } from 'ws';

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
        const value = Number(heartbeatRaw);
        if (!Number.isInteger(value) || value < 0) {
            throw new RangeError(
                `BLUE_SOCKET_HEARTBEAT_INTERVAL_MS must be a non-negative integer (ms), got: ${heartbeatRaw}`
            );
        }
        // `0` explicitly disables the heartbeat (D6).
        options.heartbeatIntervalMs = value === 0 ? null : value;
    }
    if (idleRaw !== undefined && idleRaw !== '') {
        const value = Number(idleRaw);
        if (!Number.isInteger(value) || value <= 0) {
            throw new RangeError(`BLUE_SOCKET_IDLE_TIMEOUT_MS must be a positive integer (ms), got: ${idleRaw}`);
        }
        options.idleTimeoutMs = value;
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
    #rooms: Map<string, Set<SocketSession>> = new Map();
    #transports: WeakMap<SocketSession, WebSocket> = new WeakMap();
    #lastSeen: WeakMap<SocketSession, number> = new WeakMap();
    #heartbeatIntervalMs: number | null;
    #idleTimeoutMs: number;
    #now: () => number;
    #timer: NodeJS.Timeout | null = null;

    /**
     * @param options - Heartbeat cadence and clock.
     */
    constructor(options: NodeSocketSessionRegistryOptions = {}) {
        this.#heartbeatIntervalMs = options.heartbeatIntervalMs === undefined ? 30_000 : options.heartbeatIntervalMs;
        this.#idleTimeoutMs = options.idleTimeoutMs ?? 60_000;
        this.#now = options.now ?? Date.now;
    }

    /**
     * Start tracking a session. Adapter hook — not part of the dispatcher
     * contract: registers the transport for heartbeat pings and attaches the
     * pong bookkeeping. The session auto-joins the set keyed by its endpoint
     * path (AD-21 D5). Idempotent.
     *
     * @param session - The session to track.
     * @param path - The endpoint path the session was upgraded at.
     * @param transport - The underlying `ws` connection (for pings/terminate).
     */
    register(session: SocketSession, path: string, transport: WebSocket): void {
        if (this.#sessions.has(session)) {
            return;
        }
        this.#sessions.set(session, path);
        this.#transports.set(session, transport);
        this.#lastSeen.set(session, this.#now());
        transport.on('pong', () => this.#lastSeen.set(session, this.#now()));
        this.#ensureHeartbeat();
    }

    /**
     * Sessions open at the given endpoint path (auto-join set, D5).
     *
     * @param path - The routing path (e.g. `/ws/room`).
     * @returns The matching open sessions.
     */
    sessions(path: string): readonly SocketSession[] {
        const result: SocketSession[] = [];
        for (const [session, sessionPath] of this.#sessions) {
            if (sessionPath === path) {
                result.push(session);
            }
        }
        return result;
    }

    /**
     * Number of open sessions at the given endpoint path.
     *
     * @param path - The routing path.
     * @returns The session count.
     */
    count(path: string): number {
        let total = 0;
        for (const sessionPath of this.#sessions.values()) {
            if (sessionPath === path) {
                total++;
            }
        }
        return total;
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
        for (const [session, sessionPath] of this.#sessions) {
            if (sessionPath === path) {
                this.#safeSend(session, payload);
            }
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
        for (const session of members) {
            this.#safeSend(session, payload);
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
     * @param code - Close status code (default `1001`).
     * @param reason - Human-readable close reason.
     */
    closeAll(code: number = 1001, reason: string = 'server shutting down'): void {
        for (const session of this.#sessions.keys()) {
            session.close(code, reason);
        }
    }

    /**
     * Drop a session from the registry. Idempotent; called by the transport
     * on connection close (peer or server initiated). Also stops the
     * heartbeat sweep when the last session goes away.
     *
     * @param session - The session to remove.
     */
    remove(session: SocketSession): void {
        if (!this.#sessions.delete(session)) {
            return;
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
            const lastSeen = this.#lastSeen.get(session);
            if (lastSeen !== undefined && now - lastSeen > this.#idleTimeoutMs) {
                // `terminate` closes the TCP connection abruptly; the close
                // event fires and `remove` drops the session from the
                // registry (no final frames are delivered to dead peers).
                this.#transports.get(session)?.terminate();
            }
        }
    }

    #safeSend(session: SocketSession, payload: unknown): void {
        if (session.isClosed) {
            return;
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
