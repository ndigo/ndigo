/**
 * The kanban socket protocol — one envelope for every frame the board room
 * carries.
 *
 * ```
 * { event: string, data: unknown, at: number }
 * ```
 *
 * `at` is epoch milliseconds. The server authors every frame (there is no
 * client → server mutation channel: writes are the REST surface, the socket is
 * the fan-out), with one exception — a client may send `{ event: 'resync' }`
 * to ask for a fresh snapshot.
 *
 * | event          | direction | `data`                                    |
 * | -------------- | --------- | ----------------------------------------- |
 * | `snapshot`     | S → C     | `BoardSnapshot` (sent first on every join) |
 * | `card-created` | S → C     | `{ card }`                                |
 * | `card-updated` | S → C     | `{ card }` (rename / reorder)             |
 * | `card-moved`   | S → C     | `{ card, fromColumnId }`                  |
 * | `card-deleted` | S → C     | `{ cardId, columnId }`                    |
 * | `error`        | S → C     | `{ reason }` (malformed / unknown frame)  |
 *
 * A joiner always receives the authoritative `snapshot` before any event, so a
 * reconnect reconciles instead of replaying from memory (see the README's
 * "Concurrency model").
 *
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';

/** The card mutation events a board room broadcasts. */
export const CARD_EVENTS = ['card-created', 'card-updated', 'card-moved', 'card-deleted'] as const;

/** One of {@link CARD_EVENTS}. */
export type CardEventName = (typeof CARD_EVENTS)[number];

/** The reconciliation frame: the authoritative board, sent to a joiner first. */
export const SNAPSHOT_EVENT = 'snapshot';

/** The client → server frame asking for a fresh {@link SNAPSHOT_EVENT}. */
export const RESYNC_EVENT = 'resync';

/** The server → client frame reporting a malformed or unknown inbound frame. */
export const ERROR_EVENT = 'error';

/** A fully-formed outbound frame. */
export interface Envelope {
    readonly event: string;
    readonly data: unknown;
    readonly at: number;
}

/**
 * Builds a frame; the timestamp defaults to now (kept injectable for tests).
 *
 * @param event - Event name.
 * @param data - Event payload.
 * @param at - Epoch milliseconds.
 * @returns The envelope.
 */
export function envelope(event: string, data: unknown, at: number = Date.now()): Envelope {
    return { event, data, at };
}

/**
 * The registry room a board's clients share.
 *
 * Room names are global to the socket registry, so the prefix keeps a board id
 * from colliding with any other app's room naming.
 *
 * @param boardId - The board id.
 * @returns The room name.
 */
export function boardRoom(boardId: string): string {
    return `board:${boardId}`;
}

/** Board ids accepted from a path segment (and used as room names). */
export const BOARD_ID = z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/, 'board ids are letters, digits, `_` and `-`');

/** The client → server frame shape (loose on `data`; validated per event). */
const InboundFrame = z.object({
    event: z.string().min(1),
    data: z.unknown().optional(),
});

/**
 * Parses an inbound frame payload (text or binary) into `{ event, data }`.
 *
 * @param raw - The frame payload as delivered by `SocketSession.messages`.
 * @returns The parsed frame, or `null` when the payload is not a valid frame.
 */
export function parseInbound(raw: unknown): { event: string; data: unknown } | null {
    const text = typeof raw === 'string' ? raw : raw instanceof Uint8Array ? new TextDecoder().decode(raw) : null;
    if (text === null) {
        return null;
    }
    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return null;
    }
    const parsed = InboundFrame.safeParse(value);
    return parsed.success ? { event: parsed.data.event, data: parsed.data.data } : null;
}
