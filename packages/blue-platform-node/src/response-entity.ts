/**
 * `ResponseEntity` — rich HTTP response wrapper for Node.js handlers.
 *
 * Lets a route handler set the status code, headers, and body of the response
 * instead of returning a plain object. Status codes and header names reuse the
 * vocabulary from `@blue/http` (`ResponseStatus`, `ResponseStatuses`,
 * `HTTPHeaders`).
 *
 * @module
 * @since 1.0.0
 */

import { ResponseStatus, ResponseStatuses } from '@blue/http';

/**
 * A response with an explicit HTTP status, headers, and body.
 */
export class ResponseEntity<T = unknown> {
    /**
     * The response body.
     */
    readonly body: T;
    /**
     * The HTTP status.
     */
    readonly status: ResponseStatus;
    /**
     * Response headers, keyed by header name.
     */
    readonly headers: Record<string, string>;

    /**
     * @param body - The response body.
     * @param status - The HTTP status.
     * @param headers - Response headers.
     */
    constructor(body: T, status: ResponseStatus, headers: Record<string, string> = {}) {
        this.body = body;
        this.status = status;
        this.headers = headers;
    }

    /** `200 OK` response. */
    static ok<T>(body: T): ResponseEntity<T> {
        return new ResponseEntity(body, ResponseStatuses.OK);
    }

    /** `201 Created` response. */
    static created<T>(body: T): ResponseEntity<T> {
        return new ResponseEntity(body, ResponseStatuses.CREATED);
    }

    /** `204 No Content` response. */
    static noContent(): ResponseEntity<void> {
        return new ResponseEntity(undefined, ResponseStatuses.NO_CONTENT);
    }

    /** `404 Not Found` response. */
    static notFound(): ResponseEntity<void> {
        return new ResponseEntity(undefined, ResponseStatuses.NOT_FOUND);
    }

    /** `400 Bad Request` response. */
    static badRequest<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.BAD_REQUEST);
    }

    /** `500 Internal Server Error` response. */
    static internalServerError<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.INTERNAL_SERVER_ERROR);
    }
}

/**
 * Type guard that checks whether a value is a `ResponseEntity`.
 *
 * @param value - The value to test.
 * @returns `true` when the value is a `ResponseEntity` instance.
 */
export function isResponseEntity(value: unknown): value is ResponseEntity<unknown> {
    return value instanceof ResponseEntity;
}
