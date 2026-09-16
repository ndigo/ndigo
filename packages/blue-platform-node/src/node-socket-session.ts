/**
 * Node WebSocket session — wraps a `ws` (RFC 6455) connection as a.
 * * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { SocketSession, SocketRequestSources, SocketSessionRegistry } from '@blue/dispatcher';
import type { WebSocket } from 'ws';
import { AsyncReader } from '@blue/socket';

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
     * `1009` — the inbound mirror of the registry's outbound watermark
     * (default `1024`).
     */
    maxQueuedMessages?: number;
}

/** Resolved, read-only socket limits with defaults applied. */
export interface ResolvedSocketLimits {
    readonly maxPayloadBytes: number;
    readonly maxQueuedMessages: number;
}

/** Conservative defaults: 1 MiB frames, 1024 queued inbound messages. */
export const DEFAULT_SOCKET_LIMITS: ResolvedSocketLimits = {
    maxPayloadBytes: 1_048_576,
    maxQueuedMessages: 1024,
};

/**
 * Validates and resolves socket limits from user options and the
 * environment, filling defaults (mirrors `resolveHTTPRequestLimits`).
 *
 * - `BLUE_SOCKET_MAX_PAYLOAD_BYTES` — max frame payload (default 1 MiB)
 * - `BLUE_SOCKET_MAX_QUEUED_MESSAGES` — inbound queue cap (default 1024)
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
    const resolved: Record<keyof ResolvedSocketLimits, number> = { ...DEFAULT_SOCKET_LIMITS };
    const overrides: Record<keyof ResolvedSocketLimits, string | undefined> = {
        maxPayloadBytes:
            limits.maxPayloadBytes === undefined
                ? env['BLUE_SOCKET_MAX_PAYLOAD_BYTES']
                : String(limits.maxPayloadBytes),
        maxQueuedMessages:
            limits.maxQueuedMessages === undefined
                ? env['BLUE_SOCKET_MAX_QUEUED_MESSAGES']
                : String(limits.maxQueuedMessages),
    };
    for (const key of Object.keys(DEFAULT_SOCKET_LIMITS) as Array<keyof ResolvedSocketLimits>) {
        const raw = overrides[key];
        if (raw === undefined || raw === '') continue;
        if (!/^\d+$/.test(raw)) {
            throw new RangeError(`SocketLimits.${key} must be a non-negative integer, received ${raw}`);
        }
        const value = Number(raw);
        if (value <= 0) {
            throw new RangeError(`SocketLimits.${key} must be a positive integer, received ${raw}`);
        }
        resolved[key] = value;
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
    // peer pin unbounded memory. Overflow closes the connection with `1009`
    // (message too big — the client-side mirror of the registry's outbound
    // watermark). The `closed` reader is intentionally uncapped: it holds
    // exactly one close code.
    const inbound = new AsyncReader<unknown>(limits.maxQueuedMessages, () => {
        transport.close(1009, 'inbound queue overflow');
    });
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
