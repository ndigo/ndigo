/**
 * The board wire contract shared by the socket endpoint and the scripted
 * `POST /board` route, so both publish byte-identical payloads into the same
 * room — the property that makes a message posted on one node reachable from
 * the sockets connected to the other.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */

/** The room every board session joins; the fan-out scope that crosses nodes. */
export const BOARD_ROOM = 'board';

/** The `@socketMapping` endpoint path (also the registry's auto-join key). */
export const BOARD_PATH = '/ws/board';

/** The cache name holding the demo's shared values. */
export const FANOUT_CACHE_NAME = 'fanout-values';

/** Maximum board text length, in characters (both routes enforce it). */
export const BOARD_TEXT_MAX = 4_096;

/**
 * A message as it travels from one node's publisher to every node's sockets.
 */
export interface BoardMessage {
    /** Literal discriminator; clients switch on it. */
    readonly event: 'board-message';
    /** The posted text. */
    readonly text: string;
    /** The instance id of the node that published the message. */
    readonly from: string;
    /** Publication time (ISO 8601 UTC). */
    readonly at: string;
}

/**
 * Builds the payload both board routes publish.
 *
 * @param from - The publishing node's instance id.
 * @param text - The posted text.
 * @returns The wire message.
 */
export function boardMessage(from: string, text: string): BoardMessage {
    return { event: 'board-message', text, from, at: new Date().toISOString() };
}

/**
 * Normalizes an inbound socket frame to text: text frames arrive as strings,
 * binary frames as bytes (AD-23 D8).
 *
 * @param message - The value the session's `messages` iterable yielded.
 * @returns The decoded text (`''` for a payload neither shape describes).
 */
export function boardText(message: unknown): string {
    if (typeof message === 'string') {
        return message;
    }
    if (message instanceof Uint8Array) {
        return new TextDecoder().decode(message);
    }
    if (message instanceof ArrayBuffer) {
        return new TextDecoder().decode(new Uint8Array(message));
    }
    return '';
}
