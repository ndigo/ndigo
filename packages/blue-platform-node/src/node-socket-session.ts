/**
 * Node WebSocket session — wraps a `ws` (RFC 6455) connection as a.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { SocketSession, SocketRequestSources, SocketSessionRegistry } from '@blue/dispatcher';
import type { WebSocket } from 'ws';
import { AsyncReader } from '@blue/socket';
import { readIntEnv } from './read-int-env';

/**
 * Tunable bounds for the WebSocket transport (frames + inbound buffering).
 */
export interface SocketLimits {
    /**
     * Maximum WS frame payload in bytes. Frames larger than this are
     * rejected by `ws` with close `1009` (default `1_048_576` — 1 MiB).
     */
    maxPayloadBytes?: number;
    /**
     * Maximum inbound messages queued per session awaiting the handler.
     * A slow handler fills the queue; overflow closes the session with
     * `1013` — the inbound mirror of the registry's outbound watermark
     * (default `1024` messages).
     */
    maxQueuedMessages?: number;
    /**
     * Maximum inbound bytes queued per session awaiting the handler
     * (cumulative payload size; `sizeOf` parity with the wire). Caps the
     * real memory cost of a stalled handler regardless of message count:
     * `maxQueuedMessages` alone allows `count × maxPayloadBytes` pinning
     * (default `4_194_304` — 4 MiB). `0` disables the byte budget.
     */
    maxQueuedBytes?: number;
    /**
     * Outbound watermark in bytes: a subscriber whose transport has more
     * than this many bytes buffered is handled per `onOverflow`. The
     * slow-consumer guard for **every** send path (direct
     * `SocketSession.send`, handler pumps, STOMP fan-out) — not just the
     * registry's broadcast (default `1_048_576` — 1 MiB, matching the
     * registry's default policy). `0` disables the watermark.
     */
    maxBufferedBytes?: number;
    /**
     * What happens to over-watermark outbound: `close` (default) closes
     * the session with `1013` ("try again later"); `drop` silently skips
     * the frame. Mirrors `SocketBackpressurePolicy.onOverflow`.
     */
    onOverflow?: 'close' | 'drop';
}

/** Resolved, read-only socket limits with defaults applied. */
export interface ResolvedSocketLimits {
    readonly maxPayloadBytes: number;
    readonly maxQueuedMessages: number;
    readonly maxQueuedBytes: number | null;
    readonly maxBufferedBytes: number | null;
    readonly onOverflow: 'close' | 'drop';
}

/** Conservative defaults: 1 MiB frames, 1024 queued messages, 4 MiB queued
 * bytes, 1 MiB outbound watermark, fail-closed close on overflow. */
export const DEFAULT_SOCKET_LIMITS: ResolvedSocketLimits = {
    maxPayloadBytes: 1_048_576,
    maxQueuedMessages: 1024,
    maxQueuedBytes: 4_194_304,
    maxBufferedBytes: 1_048_576,
    onOverflow: 'close',
};

/**
 * Validates and resolves socket limits from user options and the
 * environment, filling defaults (mirrors `resolveHTTPRequestLimits`).
 *
 * - `BLUE_SOCKET_MAX_PAYLOAD_BYTES` — max frame payload (default 1 MiB)
 * - `BLUE_SOCKET_MAX_QUEUED_MESSAGES` — inbound queue cap (default 1024)
 * - `BLUE_SOCKET_MAX_QUEUED_BYTES` — inbound byte budget, `0` disables
 *   (default 4 MiB)
 * - `BLUE_SOCKET_MAX_BUFFERED_BYTES` — outbound watermark, `0` disables
 *   (default 1 MiB)
 * - `BLUE_SOCKET_ON_OVERFLOW` — `close` (default, 1013) or `drop`
 *
 * Invalid values throw a `RangeError` (fail fast at boot).
 *
 * @param limits - Explicit limits (win over environment).
 * @param env - Environment to read (defaults to `process.env`).
 * @returns Resolved socket limits.
 */
export function resolveSocketLimits(
    limits: SocketLimits = {},
    env: Readonly<Record<string, string | undefined>> = process.env
): ResolvedSocketLimits {
    const envNames = {
        maxPayloadBytes: 'BLUE_SOCKET_MAX_PAYLOAD_BYTES',
        maxQueuedMessages: 'BLUE_SOCKET_MAX_QUEUED_MESSAGES',
        maxQueuedBytes: 'BLUE_SOCKET_MAX_QUEUED_BYTES',
        maxBufferedBytes: 'BLUE_SOCKET_MAX_BUFFERED_BYTES',
    } as const;
    const resolved: {
        maxPayloadBytes: number;
        maxQueuedMessages: number;
        maxQueuedBytes: number | null;
        maxBufferedBytes: number | null;
        onOverflow: 'close' | 'drop';
    } = { ...DEFAULT_SOCKET_LIMITS };
    for (const key of ['maxPayloadBytes', 'maxQueuedMessages'] as const) {
        const explicit = limits[key];
        if (explicit !== undefined) {
            if (typeof explicit !== 'number' || !Number.isFinite(explicit) || explicit <= 0) {
                throw new RangeError(`SocketLimits.${key} must be a positive integer, received ${explicit}`);
            }
            resolved[key] = Math.floor(explicit);
            continue;
        }
        const value = readIntEnv(env, envNames[key]);
        if (value !== undefined) {
            resolved[key] = value;
        }
    }
    // Byte budgets: `0`/null explicitly disables the bound; absent means
    // "use the env var", absent there means "use the default".
    for (const key of ['maxQueuedBytes', 'maxBufferedBytes'] as const) {
        const explicit = limits[key as 'maxQueuedBytes'];
        if (explicit !== undefined && explicit !== null) {
            if (typeof explicit !== 'number' || !Number.isFinite(explicit) || explicit < 0) {
                throw new RangeError(`SocketLimits.${key} must be a non-negative integer, received ${explicit}`);
            }
            resolved[key] = explicit === 0 ? null : Math.floor(explicit);
            continue;
        }
        if (explicit === 0 || explicit === null) {
            resolved[key] = null;
            continue;
        }
        const value = readIntEnv(env, envNames[key], { allowZero: true });
        if (value !== undefined) {
            resolved[key] = value === 0 ? null : value;
        }
    }
    const overflowRaw = limits.onOverflow ?? env['BLUE_SOCKET_ON_OVERFLOW'] ?? undefined;
    if (overflowRaw !== undefined) {
        if (overflowRaw !== 'close' && overflowRaw !== 'drop') {
            throw new RangeError(`SocketLimits.onOverflow must be 'close' or 'drop', received ${overflowRaw}`);
        }
        resolved.onOverflow = overflowRaw;
    }
    return resolved;
}

/**
 * RFC 6455 close-status validation (mirrors the `ws` client's valid range):
 * 1000–1014 excluding the reserved 1004/1005/1006, or 3000–4999
 * (application-defined). Reasons are capped at 123 UTF-8 bytes (RFC 6455
 * §5.5.1). Invalid input throws a `RangeError` instead of surfacing as a
 * late `ws` error mid-loop (e.g. a `closeAll` aborting on the first bad
 * session).
 */
export function assertCloseFrame(code: number, reason: string): void {
    const validCode =
        (code >= 1000 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006) ||
        (code >= 3000 && code <= 4999);
    if (!validCode) {
        throw new RangeError(`invalid close code: ${code}`);
    }
    if (Buffer.byteLength(reason, 'utf-8') > 123) {
        throw new RangeError(`close reason exceeds 123 bytes: ${reason.length} chars`);
    }
}

/**
 * Creates a {@link SocketSession} on top of a `ws` WebSocket connection.
 *
 * @param transport - The underlying `ws` WebSocket (or transport-compatible
 *   double in tests).
 * @param path - The request path (for `session.path`).
 * @param sources - Request sources captured from the upgrade request.
 * @param registry - Optional session registry backing `join`/`leave`
 *   (AD-21 D5); when `null`, room membership is a no-op.
 * @param limits - Transport bounds (frame payload, inbound queue cap).
 * @returns The session.
 */
export function nodeSocketSession(
    transport: WebSocket,
    path: string,
    sources: SocketRequestSources = { query: {}, headers: {}, cookies: {} },
    registry: Pick<SocketSessionRegistry, 'join' | 'leave'> | null = null,
    limits: ResolvedSocketLimits = DEFAULT_SOCKET_LIMITS
): SocketSession {
    // Bounded inbound queue: a handler that stops draining must not let the
    // peer pin unbounded memory. Overflow closes the connection with `1013`
    // ("try again later" — the consuming side is the slow party; 1009 stays
    // reserved for per-frame size violations, which ws sends itself for
    // maxPayload). The bound is both a message count and a cumulative byte
    // budget (count × maxPayload would otherwise allow ~1 GiB pinning at
    // the defaults). The `closed` reader is intentionally uncapped: it
    // holds exactly one close code.
    const inbound = new AsyncReader<unknown>(
        limits.maxQueuedMessages,
        () => {
            try {
                transport.close(1013, 'inbound queue overflow');
            } catch {
                // Raced close — the transport's close event completes the
                // reader either way.
            }
        },
        {
            maxBytes: limits.maxQueuedBytes,
            sizeOf: (value: unknown): number => {
                if (typeof value === 'string') return Buffer.byteLength(value, 'utf-8');
                if (Buffer.isBuffer(value)) return value.length;
                if (value instanceof Uint8Array) return value.length;
                if (value instanceof ArrayBuffer) return value.byteLength;
                return 1;
            },
        }
    );
    const closed = new AsyncReader<number>();
    let isClosed = false;

    const onMessage = (data: unknown, isBinary: boolean): void => {
        // ws delivers Buffer payloads with an `isBinary` flag for both
        // frame types (AD-23 D8). Text frames stay strings (the contract's
        // promise for echo/chat patterns); binary frames surface byte-exact
        // as Uint8Array so STOMP binary bodies (content-length) survive.
        if (isBinary) {
            inbound.push(Buffer.isBuffer(data) ? new Uint8Array(data) : data);
        } else {
            inbound.push(typeof data === 'string' ? data : Buffer.isBuffer(data) ? data.toString('utf-8') : data);
        }
    };
    const onClose = (code: number, reason: string): void => {
        isClosed = true;
        inbound.complete();
        closed.push(code);
        closed.complete();
    };
    const onError = (): void => {
        // ws emits 'error' on the connection for receiver protocol violations
        // (maxPayload exceeded → 1009, invalid UTF-8 → 1007, bad opcodes) and
        // sender write failures. Without a listener, Node's EventEmitter
        // throws `uncaughtException` and the whole process dies. The close
        // event (1006/1007/1009) always follows, completing the session
        // streams and dropping the session from the registry.
    };
    transport.on('message', onMessage);
    transport.on('close', onClose);
    transport.on('error', onError);

    return {
        get path() {
            return path;
        },
        get params() {
            // Reserved for parity with the dispatcher contract; socket
            // parameters are bound positionally to the handler arguments.
            return {};
        },
        get query() {
            return sources.query;
        },
        get headers() {
            return sources.headers;
        },
        get cookies() {
            return sources.cookies;
        },
        get messages() {
            return inbound.iterable();
        },
        get closed() {
            return closed.iterable();
        },
        get isClosed() {
            return isClosed;
        },
        attributes: {},
        send(data: unknown) {
            // Slow-consumer watermark (AD-21 D6 backpressure): every
            // outbound path — direct send, handler pumps, STOMP fan-out —
            // checks the transport buffer here, not just the registry's
            // broadcast. Over the watermark: `close` mode closes with 1013
            // (the AD-22 client reconnects with backoff) or `drop` mode
            // silently skips the frame. The memory cost of a room is set
            // by its slowest member.
            const buffered = transport.bufferedAmount;
            if (
                typeof buffered === 'number' &&
                limits.maxBufferedBytes !== null &&
                buffered > limits.maxBufferedBytes
            ) {
                if (limits.onOverflow === 'close') {
                    try {
                        transport.close(1013, 'consumer too slow');
                    } catch {
                        // Raced close — the transport's close event drops
                        // the session from the registry.
                    }
                }
                return;
            }
            if (typeof data === 'string') {
                transport.send(data);
            } else if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
                // Binary body/frame passthrough (AD-23 D8): Uint8Array →
                // binary frame, byte-exact.
                transport.send(Buffer.from(data as Uint8Array));
            } else {
                transport.send(JSON.stringify(data));
            }
        },
        close(code?: number, reason?: string) {
            const closeCode = code ?? 1000;
            const closeReason = reason ?? '';
            // Fail fast here (RangeError) — ws would otherwise throw from
            // inside a broadcast/closeAll loop, aborting it mid-way.
            assertCloseFrame(closeCode, closeReason);
            transport.close(closeCode, closeReason);
        },
        join(room: string) {
            if (!isClosed) {
                registry?.join(this, room);
            }
        },
        leave(room: string) {
            if (!isClosed) {
                registry?.leave(this, room);
            }
        },
    };
}
