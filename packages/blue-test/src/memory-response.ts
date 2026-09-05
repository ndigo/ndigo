/**
 * In-memory HTTP response captured by a {@link MockMvcDispatch}.
 *
 * Replaces the real `node:http` `ServerResponse` with a plain object the
 * dispatcher can write to, so integration tests run socket-free.
 *
 * @module
 * @since 1.0.0
 */

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
    headers: Record<string, string>;
    /** Raw body as written by the handler/view, intended for `.json()`/`.text()`. */
    body: unknown;
    /** Whether the response was finalized (`end()` called). */
    completed: boolean;
}

const okStatus = 200;

/**
 * The minimal `ServerResponse`-shaped sink the pipeline writes to. Only the
 * members `HTTPResponseViewTarget` / `ResponseEntityView` touch are present.
 */
export interface ResponseSink {
    /** Whether the response head has been written. */
    readonly headersSent: boolean;
    /** Record the status and headers. */
    writeHead(status: number, headers?: Record<string, string>): void;
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

        writeHead(status: number, headers?: Record<string, string>): void {
            response.status = status;
            if (headers) {
                response.headers = { ...headers };
            }
            headersSent = true;
        },

        end(body?: string | unknown): void {
            response.body = body;
            response.completed = true;
        },
    };

    return { response, sink };
}
