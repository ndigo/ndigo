/**
 * The chat wire protocol — one stable envelope for every frame in both
 * directions.
 *
 * ```
 * { event: string, data: unknown, at: number, from: string }
 * ```
 *
 * `at` is epoch milliseconds and `from` the sender's display name (`server`
 * for frames the application emits). Events:
 *
 * | event      | direction | `data`                                        |
 * | ---------- | --------- | --------------------------------------------- |
 * | `history`  | S → C     | `{ room, messages: ChatMessage[] }`           |
 * | `message`  | both      | `ChatMessage` (C → S: the text string)        |
 * | `presence` | S → C     | `{ room, users: string[], joined?, left? }`   |
 * | `typing`   | both      | `boolean`                                     |
 * | `error`    | S → C     | `{ reason: string }`                          |
 */
import { z } from 'zod';
import type { ChatMessage } from './room-service';

/** Who a server-authored frame is `from`. */
export const SERVER = 'server';

/** A fully-formed outbound frame. */
export interface Envelope {
    readonly event: string;
    readonly data: unknown;
    readonly at: number;
    readonly from: string;
}

/** Maximum accepted message length (characters). */
export const MAX_MESSAGE_LENGTH = 2_000;

/** Valid room name: path segment-safe, non-empty, bounded. */
export const ROOM_NAME = z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/);

/**
 * Builds a frame with the current time.
 *
 * @param event - Event name.
 * @param data - Event payload.
 * @param from - Sender display name (`SERVER` for application frames).
 * @param at - Epoch milliseconds; defaults to now (kept injectable for tests).
 * @returns The envelope.
 */
export function envelope(event: string, data: unknown, from: string, at: number = Date.now()): Envelope {
    return { event, data, at, from };
}

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

/** Re-exported for the client-facing docs; the shape is shared by reference. */
export type { ChatMessage };
