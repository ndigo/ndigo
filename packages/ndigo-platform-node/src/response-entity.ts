/**
 * `ResponseEntity` — rich HTTP response wrapper for Node.js handlers.
 */
import { ResponseStatus, ResponseStatuses } from '@ndigo/http';

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
     * Creates a response entity.
     *
     * @param body - The response body.
     * @param status - The HTTP status.
     * @param headers - Response headers.
     */
    constructor(body: T, status: ResponseStatus, headers: Record<string, string> = {}) {
        this.body = body;
        this.status = status;
        this.headers = headers;
    }

    /**
     * Creates a `200 OK` response.
     *
     * @param body - The response body.
     * @returns The response entity.
     */
    static ok<T>(body: T): ResponseEntity<T> {
        return new ResponseEntity(body, ResponseStatuses.OK);
    }

    /**
     * Creates a `201 Created` response.
     *
     * @param body - The response body.
     * @returns The response entity.
     */
    static created<T>(body: T): ResponseEntity<T> {
        return new ResponseEntity(body, ResponseStatuses.CREATED);
    }

    /**
     * Creates a `204 No Content` response.
     *
     * @returns The response entity.
     */
    static noContent(): ResponseEntity<void> {
        return new ResponseEntity(undefined, ResponseStatuses.NO_CONTENT);
    }

    /**
     * Creates a `404 Not Found` response.
     *
     * @returns The response entity.
     */
    static notFound(): ResponseEntity<void> {
        return new ResponseEntity(undefined, ResponseStatuses.NOT_FOUND);
    }

    /**
     * Creates a `400 Bad Request` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static badRequest<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.BAD_REQUEST);
    }

    /**
     * Creates a `401 Unauthorized` response.
     *
     * @param body - The optional response body.
     * @param headers - Response headers.
     * @returns The response entity.
     */
    static unauthorized<T = unknown>(body?: T, headers: Record<string, string> = {}): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.UNAUTHORIZED, headers);
    }

    /**
     * Creates a `403 Forbidden` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static forbidden<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.FORBIDDEN);
    }

    /**
     * Creates a `405 Method Not Allowed` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static methodNotAllowed<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.METHOD_NOT_ALLOWED);
    }

    /**
     * Creates a `406 Not Acceptable` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static notAcceptable<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.NOT_ACCEPTABLE);
    }

    /**
     * Creates a `415 Unsupported Media Type` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static unsupportedMediaType<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.UNSUPPORTED_MEDIA_TYPE);
    }

    /**
     * Creates a `422 Unprocessable Entity` response (schema validation failures).
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static unprocessableEntity<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.UNPROCESSABLE_ENTITY);
    }

    /**
     * Creates a `429 Too Many Requests` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static tooManyRequests<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.TOO_MANY_REQUESTS);
    }

    /**
     * Creates a `503 Service Unavailable` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
    static serviceUnavailable<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.SERVICE_UNAVAILABLE);
    }

    /**
     * Creates a `500 Internal Server Error` response.
     *
     * @param body - The optional response body.
     * @returns The response entity.
     */
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
