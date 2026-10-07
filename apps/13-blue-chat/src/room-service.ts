/**
 * Per-room state for the chat demo: a bounded message history and the live
 * presence roster.
 *
 * The transport fan-out itself belongs to the platform's
 * `SocketSessionRegistry` (rooms + `broadcastTo`); this bean owns only the
 * application data a newcomer needs — the last N messages to replay and who is
 * currently connected. Both maps are bounded by application policy, so a busy
 * room cannot grow the process without limit.
 * @module blue-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { SocketSession } from '@blue/dispatcher';

/** One chat message as stored and replayed (the `message`/`history` payload). */
export interface ChatMessage {
    /** Stable identity — the client deduplicates replayed history by this. */
    readonly id: string;
    /** Display name of the sender. */
    readonly from: string;
    /** Message body (already length-checked by the controller). */
    readonly text: string;
    /** Epoch milliseconds the server accepted the message. */
    readonly at: number;
}

/** Default per-room history bound (the newest N messages are kept). */
export const DEFAULT_HISTORY_LIMIT = 50;

/**
 * Bounded history + presence bookkeeping, one instance shared by every room
 * connection.
 */
export class RoomService {
    readonly #history = new Map<string, ChatMessage[]>();
    readonly #members = new Map<string, Map<SocketSession, string>>();
    readonly #limit: number;

    /**
     * @param limit - Per-room history bound; the oldest messages are evicted
     *   once this is exceeded.
     */
    constructor(limit: number = DEFAULT_HISTORY_LIMIT) {
        this.#limit = limit;
    }

    /**
     * The room's current history, oldest first.
     *
     * @param room - Room name.
     * @returns A read-only view of the stored messages (never the mutable array).
     */
    history(room: string): readonly ChatMessage[] {
        return this.#history.get(room) ?? [];
    }

    /**
     * Appends a message, evicting the oldest past the history bound.
     *
     * @param room - Room name.
     * @param message - The message to store.
     */
    append(room: string, message: ChatMessage): void {
        const messages = this.#history.get(room) ?? [];
        messages.push(message);
        if (messages.length > this.#limit) {
            messages.splice(0, messages.length - this.#limit);
        }
        this.#history.set(room, messages);
    }

    /**
     * Registers a session in the room's presence roster.
     *
     * @param room - Room name.
     * @param session - The joining session.
     * @param user - Its display name.
     */
    join(room: string, session: SocketSession, user: string): void {
        const members = this.#members.get(room) ?? new Map<SocketSession, string>();
        members.set(session, user);
        this.#members.set(room, members);
    }

    /**
     * Removes a session from the room's presence roster.
     *
     * @param room - Room name.
     * @param session - The departing session.
     * @returns The departed display name, or `undefined` when it was unknown.
     */
    leave(room: string, session: SocketSession): string | undefined {
        const members = this.#members.get(room);
        if (members === undefined) {
            return undefined;
        }
        const user = members.get(session);
        members.delete(session);
        if (members.size === 0) {
            this.#members.delete(room);
        }
        return user;
    }

    /**
     * The roster's distinct display names, sorted for deterministic frames.
     *
     * @param room - Room name.
     * @returns The sorted unique display names currently connected.
     */
    users(room: string): string[] {
        const members = this.#members.get(room);
        if (members === undefined) {
            return [];
        }
        return [...new Set(members.values())].sort();
    }

    /**
     * Number of live sessions in the room.
     *
     * @param room - Room name.
     * @returns The session count.
     */
    memberCount(room: string): number {
        return this.#members.get(room)?.size ?? 0;
    }
}
