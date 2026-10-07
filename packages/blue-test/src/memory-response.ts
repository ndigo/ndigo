/**
 * In-memory HTTP response captured by a {@link MockMvcDispatch}.
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
import { foldHeaderName } from '@blue/http';

/**
 * A captured HTTP response: status code, headers, and body.
 *
 * The body is captured raw (as delivered by `end`) — call `.json()` or
 * `.text()` to interpret it.
 */
export interface MemoryResponse {
    /** HTTP status code (defaults to 200). */
    status: number;
    /** Response headers (lower-cased keys). */
    headers: Record<string, string | string[]>;
    /** Raw body as written by the handler/view, intended for `.json()`/`.text()`. */
    body: unknown;
    /** Whether the response was finalized (`end()` called). */
    completed: boolean;
}

const okStatus = 200;

/**
 * The `ServerResponse`-shaped sink the pipeline writes to: the members
 * `HTTPResponseViewTarget` / `ResponseEntityView` and server interceptors
 * (CORS, CSRF, security headers) touch — `writeHead` merges with headers set
 * earlier via {@link ResponseSink.setHeader}, mirroring Node's semantics.
 */
export interface ResponseSink {
    /** Whether the response head has been written. */
    readonly headersSent: boolean;
    /** Record a single header (lower-cased key), merging with prior sets. */
    setHeader(name: string, value: string | string[]): void;
    /** Read a previously set header (case-insensitive), mirroring `ServerResponse`. */
    getHeader(name: string): string | string[] | undefined;
    /** Remove a header previously set (lower-cased key; no-op when absent). */
    removeHeader(name: string): void;
    /** Record the status and headers, merging with prior sets. */
    writeHead(status: number, headers?: Record<string, string | string[]>): void;
    /**
     * Stream a body chunk into `response.body` (concatenated, in order).
     * Returns `true` — an in-memory sink never backpressures.
     */
    write(chunk: string | Uint8Array): boolean;
    /** Abort the response (stream failure after headers were sent). */
    destroy(): void;
    /** Finalize the response with the given body. */
    end(body?: string | unknown): void;
}

/**
 * Creates an in-memory response sink usable as `route.attributes[NODE_RESPONSE_ATTRIBUTE]`.
 *
 * @returns A mutable response record plus the `ServerResponse`-shaped sink.
 */
export function createMemoryResponse(): { response: MemoryResponse; sink: ResponseSink } {
    const response: MemoryResponse = {
        status: okStatus,
        headers: {},
        body: undefined,
        completed: false,
    };

    let headersSent = false;

    const sink: ResponseSink = {
        get headersSent(): boolean {
            return headersSent;
        },

        setHeader(name: string, value: string | string[]): void {
            response.headers[foldHeaderName(name)] = value;
        },

        getHeader(name: string): string | string[] | undefined {
            return response.headers[foldHeaderName(name)];
        },

        removeHeader(name: string): void {
            delete response.headers[foldHeaderName(name)];
        },

        writeHead(status: number, headers?: Record<string, string | string[]>): void {
            response.status = status;
            if (headers) {
                for (const [name, value] of Object.entries(headers)) {
                    response.headers[foldHeaderName(name)] = value;
                }
            }
            headersSent = true;
        },

        write(chunk: string | Uint8Array): boolean {
            const piece = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string);
            response.body = response.body === undefined ? piece : Buffer.concat([response.body as Buffer, piece]);
            return true;
        },

        destroy(): void {
            // Aborted after headers were sent — the response is finalized
            // with whatever body made it through.
            response.completed = true;
        },

        end(body?: string | unknown): void {
            // A finalization without a body must not clobber chunks already
            // delivered via write() (streamed payloads).
            if (body !== undefined) {
                response.body = body;
            }
            response.completed = true;
        },
    };

    return { response, sink };
}
