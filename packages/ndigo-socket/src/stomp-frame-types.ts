/**
 * STOMP frame contracts.
 *
 * @example
 * ```ts
 * type _Alias = STOMPBody;
 * ```
 */

export type STOMPBody = string | Uint8Array;

/** A parsed STOMP frame. `command: ''` marks a heart-beat ping. *
 * @example
 * ```ts
 * const frame: STOMPFrame = { command: 'SEND', headers: {}, body: 'hello' };
 * ```
 */
export interface STOMPFrame {
    /** Frame command (`CONNECT`, `SEND`, …, or `''` for a ping). */
    command: string;
    /** Decoded header map; names as sent, values unescaped. */
    headers: Record<string, string>;
    /** Frame body — string for text frames, bytes for binary. */
    body: STOMPBody;
}

/** Byte-like inputs the codec accepts (binary WS frames, node Buffers). */
export type STOMPWireInput = string | Uint8Array | ArrayBuffer;
