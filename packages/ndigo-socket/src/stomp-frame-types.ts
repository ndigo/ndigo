/**
 * STOMP frame contracts.
 *
 * @example
 * ```ts
 * type _Alias = StompBody;
 * ```
 */

export type StompBody = string | Uint8Array;

/** A parsed STOMP frame. `command: ''` marks a heart-beat ping. *
 * @example
 * ```ts
 * const frame: StompFrame = { command: 'SEND', headers: {}, body: 'hello' };
 * ```
 */
export interface StompFrame {
    /** Frame command (`CONNECT`, `SEND`, …, or `''` for a ping). */
    command: string;
    /** Decoded header map; names as sent, values unescaped. */
    headers: Record<string, string>;
    /** Frame body — string for text frames, bytes for binary (D8). */
    body: StompBody;
}

/** Byte-like inputs the codec accepts (binary WS frames, node Buffers). */
/**
 * StompWireInput.
 *
 * @example
 * ```ts
 * type _Alias = StompWireInput;
 * ```
 */
export type StompWireInput = string | Uint8Array | ArrayBuffer;

/** Raised on malformed frames (missing NUL, bad `content-length`, …). */
