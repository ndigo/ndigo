/**
 * WebSocket session registry contract — tracks live connections and fan-out.
 * * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { SocketSession } from './socket-session';

/**
 * Tracks live WebSocket sessions and broadcasts to them (AD-21 D3/D5).
 *
 * Sessions auto-join the set keyed by their endpoint path
 * (`broadcast('/ws/room', …)` reaches every session upgraded at that path,
 * zero setup); finer grouping is available through named rooms via
 * {@link SocketSession.join}/{@link SocketSession.leave}.
 *
 * This is a **type-only contract**: the dispatcher's execution path never
 * references it. Implementations (e.g. the Node transport) are registered
 * as application-context beans; any service with the registry can push to
 * a room (scheduler → room, HTTP → room) — AD-21 D4.
 */
export interface SocketSessionRegistry {
    /**
     * Sessions open at the given endpoint path (auto-join set, D5).
     *
     * @param path - The routing path (e.g. `/ws/room`).
     * @returns The matching open sessions.
     */
    sessions(path: string): readonly SocketSession[];

    /**
     * Number of open sessions at the given endpoint path.
     *
     * @param path - The routing path.
     * @returns The session count.
     */
    count(path: string): number;

    /**
     * Send a payload to every open session at the given endpoint path.
     *
     * Payload parity with `SocketSession.send`: strings are sent as text
     * frames; any other value is JSON-encoded. Best-effort fan-out —
     * sessions that close mid-broadcast are skipped and transport write
     * errors are tolerated (D5).
     *
     * @param path - The routing path (e.g. `/ws/room`).
     * @param payload - The payload to send.
     */
    broadcast(path: string, payload: unknown): void;

    /**
     * Send a payload to every session in the named room
     * (`session.join(room)` — D5).
     *
     * @param room - The room name.
     * @param payload - The payload to send.
     */
    broadcastTo(room: string, payload: unknown): void;

    /**
     * Add a session to a named room.
     *
     * @param session - The session to add.
     * @param room - The room name.
     */
    join(session: SocketSession, room: string): void;

    /**
     * Remove a session from a named room.
     *
     * @param session - The session to remove.
     * @param room - The room name.
     */
    leave(session: SocketSession, room: string): void;

    /**
     * Close every open session.
     *
     * @param code - Close status code (default `1001` going away).
     * @param reason - Human-readable close reason.
     */
    closeAll(code?: number, reason?: string): void;

    /**
     * Drop a session from the registry. Idempotent; called by the
     * transport when a connection closes (peer or server initiated).
     *
     * @param session - The session to remove.
     */
    remove(session: SocketSession): void;
}