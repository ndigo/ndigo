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

    /** `401 Unauthorized` response. */
    static unauthorized<T = unknown>(body?: T, headers: Record<string, string> = {}): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.UNAUTHORIZED, headers);
    }

    /** `403 Forbidden` response. */
    static forbidden<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.FORBIDDEN);
    }

    /** `405 Method Not Allowed` response. */
    static methodNotAllowed<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.METHOD_NOT_ALLOWED);
    }

    /** `406 Not Acceptable` response. */
    static notAcceptable<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.NOT_ACCEPTABLE);
    }

    /** `415 Unsupported Media Type` response. */
    static unsupportedMediaType<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.UNSUPPORTED_MEDIA_TYPE);
    }

    /** `422 Unprocessable Entity` response (schema validation failures). */
    static unprocessableEntity<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.UNPROCESSABLE_ENTITY);
    }

    /** `429 Too Many Requests` response. */
    static tooManyRequests<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.TOO_MANY_REQUESTS);
    }

    /** `503 Service Unavailable` response. */
    static serviceUnavailable<T = unknown>(body?: T): ResponseEntity<T | undefined> {
        return new ResponseEntity(body, ResponseStatuses.SERVICE_UNAVAILABLE);
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
