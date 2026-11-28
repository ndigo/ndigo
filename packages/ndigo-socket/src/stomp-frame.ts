/**
 * STOMP 1.2 frame codec — parse/serialize text **and binary** frames.
 *
 * Wire shape: `COMMAND EOL header:value EOL ... EOL body\0` — an
 * EOL-delimited header block, a blank line, then the NUL-terminated body.
 * `EOL = [CR] LF` (STOMP 1.2 §1.2): lines may end in `\n` or `\r\n`, and
 * the two may be mixed inside one frame; a CR anywhere else in a line is a
 * protocol error. Header values escape `\\` → `\\\\`, newline → `\\n`,
 * carriage return → `\\r`, colon → `\\c`; any other backslash sequence is a
 * fatal protocol error (STOMP 1.2 §1.2, "Undefined escape sequences").
 * `content-length` is honored when present (the body is exactly that many
 * bytes; binary bodies require it and NULs inside are body data, not
 * terminators). A repeated header name keeps its first value (§1.2,
 * "Repeated Header Entries").
 *
 * The codec is transport-agnostic. Inbound accepts `string` (text frames)
 * or byte inputs (`Uint8Array`/`ArrayBuffer`/`Buffer` — binary frames,
 * D8); outbound returns a `string` for text bodies and a `Uint8Array`
 * when the body is bytes. Headers are always text; only the body is
 * byte-exact.
 *
 * A frame that is empty or holds nothing but EOLs (`\n` or `\r\n`),
 * optionally followed by a NUL in the byte path, is a heart-beat ping
 * (`command: ''`), matching STOMP 1.2 §4.2.3.
 *
 * The terminating NUL may be followed by any number of EOLs ("The NULL
 * octet can optionally be followed by multiple EOLs", §1.2); any other
 * octet after the NUL is trailing data and fatal.
 */
export * from './stomp-frame-types.js';
export { STOMPProtocolError } from './stomp-frame-error.js';
export { parseStompFrame, parseTextFrame } from './stomp-frame-parse.js';
export { serializeStompFrame, bodyAsText } from './stomp-frame-serialize.js';
