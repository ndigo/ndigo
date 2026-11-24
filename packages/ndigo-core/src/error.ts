/**
 * Framework error hierarchy: `FrameworkError`, `ApplicationError`, `IllegalStateError`.
 *
 * Classification is data, not inheritance: every error carries a
 * `disposition` (whose fault it is), an optional structural `status`, and an
 * optional `problemType` URI. The class lineage says *who threw it*; the
 * disposition says *how it should be rendered and logged*. Records cross
 * package boundaries by shape, never by `instanceof`, so duplicate package
 * copies cannot break the contract.
 */
import { Serializable, JSONObject } from './serializable.js';
import { createNull } from './null.js';
import { Constructable } from './constructable.js';

const { setPrototypeOf } = Reflect;

/**
 * A mixin that adds serialization capabilities to an Error class, allowing it to be converted to a JSON object.
 * @typeParam T - The constructor type of the Error class to extend.
 * @param superclass - The Error class to extend.
 * @returns A new class that is an Error and also `Serializable`.
 */
export const AsSerializableError = <T extends Constructable<Error>>(superclass: T): Constructable<Serializable> & T =>
    class extends superclass implements Serializable {
        /**
         * Converts the error instance into a JSON object, including its name, message, and stack trace.
         * @returns A JSON object representation of the error.
         */
        toJSON(): JSONObject {
            const json = createNull();
            json.name = this.name;
            json.message = this.message;
            json.stack = this.stack;
            return json;
        }

        /**
         * Returns a string representation of the error, which is its message.
         * @returns The error message.
         */
        toString(): string {
            return this.message;
        }
    };

/**
 * Whose fault the failure is and how loudly it should be logged.
 *
 * - `framework` — the framework failed or is misconfigured; log at error level.
 * - `application` — the application's domain failed; log at error level.
 * - `client` — the request was invalid/unfulfillable; render its status, log as
 *   a client fault, and require a `status` + `problemType`.
 */
export type ErrorDisposition = 'framework' | 'application' | 'client';

/**
 * The minimal status shape an error carries. `ResponseStatus` satisfies it
 * structurally; the reason phrase is optional so the kernel does not depend on
 * `@ndigo/http`.
 */
export interface ProblemStatus {
    /** The numeric HTTP status code. */
    readonly code: number;
    /** The reason phrase, when the status came from `ResponseStatus`. */
    readonly text?: string;
}

/**
 * Options accepted by `ApplicationError` and `FrameworkError`.
 */
export interface NdigoErrorOptions extends ErrorOptions {
    /** Whose fault the failure is; defaults per base class. */
    readonly disposition?: ErrorDisposition;
    /** The status to render; required when `disposition` is `client`. */
    readonly problemStatus?: ProblemStatus;
    /** The `urn:ndigo:*` problem type; required when `disposition` is `client`. */
    readonly problemType?: string;
}

/**
 * A thrown value that carries the client-error rendering contract.
 */
export interface ClientProblem {
    /** Always `client`. */
    readonly disposition: 'client';
    /** The status to render. */
    readonly problemStatus: ProblemStatus;
    /** The `urn:ndigo:*` problem type. */
    readonly problemType: string;
    /** The human-readable detail. */
    readonly message: string;
}

/**
 * Structural check for a client error. Never uses `instanceof`: the contract is
 * the shape, so it survives duplicate package copies and serialized errors.
 *
 * @param value - The thrown value.
 * @returns `true` when the value carries a client disposition, status, and
 *   problem type.
 */
export function likeClientProblem(value: unknown): value is ClientProblem {
    if (value === null || typeof value !== 'object') {
        return false;
    }

    const candidate = value as {
        disposition?: unknown;
        problemStatus?: { code?: unknown } | null;
        problemType?: unknown;
        message?: unknown;
    };

    return (
        candidate.disposition === 'client' &&
        candidate.problemStatus !== null &&
        typeof candidate.problemStatus === 'object' &&
        typeof candidate.problemStatus.code === 'number' &&
        typeof candidate.problemType === 'string' &&
        typeof candidate.message === 'string'
    );
}

/**
 * Rejects a client disposition without the data needed to render it.
 *
 * @param disposition - The resolved disposition.
 * @param status - The resolved status, if any.
 * @param problemType - The resolved problem type, if any.
 * @throws TypeError when a client error is missing its status or problem type.
 */
function assertClientDisposition(
    disposition: ErrorDisposition,
    status: ProblemStatus | null,
    problemType: string | null
): void {
    if (disposition === 'client' && (status === null || problemType === null)) {
        throw new TypeError("A 'client' disposition requires both a status and a problemType");
    }
}

/**
 * Serializes a classified error. The status is deliberately omitted: the same
 * failure renders differently on HTTP, a queue, or a gRPC surface.
 *
 * @param error - The classified error.
 * @returns The enriched JSON object.
 */
function serializeClassifiedError(error: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
    readonly disposition: ErrorDisposition;
    readonly problemType: string | null;
}): JSONObject {
    const json = createNull();
    json.name = error.name;
    json.message = error.message;
    json.stack = error.stack;
    json.disposition = error.disposition;
    if (error.problemType !== null) {
        json.problemType = error.problemType;
    }
    return json;
}

/**
 * Represents a general application-level error.
 *
 * @example
 * ```ts
 * throw new ApplicationError('boom', { cause: originalError });
 * ```
 */
export class ApplicationError extends AsSerializableError(Error) {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'ApplicationError';
    }

    /** Whose fault the failure is. Defaults to `application`. */
    readonly disposition: ErrorDisposition;
    /** The status to render, when the failure is client-facing. */
    readonly problemStatus: ProblemStatus | null;
    /** The `urn:ndigo:*` problem type, when the failure is client-facing. */
    readonly problemType: string | null;

    /**
     * Creates an instance of ApplicationError.
     * Uses `new.target.name` so subclasses inherit the correct name automatically.
     * @param message - The error message.
     * @param options - Cause and classification; `disposition: 'client'`
     *   requires both `status` and `problemType`.
     */
    constructor(message?: string, options?: NdigoErrorOptions) {
        super(message, options);
        this.name = new.target.name;
        this.disposition = options?.disposition ?? 'application';
        this.problemStatus = options?.problemStatus ?? null;
        this.problemType = options?.problemType ?? null;
        assertClientDisposition(this.disposition, this.problemStatus, this.problemType);
        setPrototypeOf(this, new.target.prototype);
    }

    /**
     * Serializes the error, including its classification.
     * @returns The JSON representation.
     */
    override toJSON(): JSONObject {
        return serializeClassifiedError(this);
    }
}

/**
 * Represents an error within the framework itself.
 *
 * @example
 * ```ts
 * throw new FrameworkError('cache backend unavailable', { cause: originalError });
 * ```
 */
export class FrameworkError extends AsSerializableError(Error) {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'FrameworkError';
    }

    /** Whose fault the failure is. Defaults to `framework`. */
    readonly disposition: ErrorDisposition;
    /** The status to render, when the failure is client-facing. */
    readonly problemStatus: ProblemStatus | null;
    /** The `urn:ndigo:*` problem type, when the failure is client-facing. */
    readonly problemType: string | null;

    /**
     * Creates an instance of FrameworkError.
     * Uses `new.target.name` so subclasses inherit the correct name automatically.
     * @param message - The error message.
     * @param options - Standard `Error` options plus the classification;
     *   `{ cause }` preserves the original failure (e.g. across
     *   `Application.run()` startup failures). `disposition: 'client'`
     *   requires both `status` and `problemType`.
     */
    constructor(message?: string, options?: NdigoErrorOptions) {
        super(message, options);
        this.name = new.target.name;
        this.disposition = options?.disposition ?? 'framework';
        this.problemStatus = options?.problemStatus ?? null;
        this.problemType = options?.problemType ?? null;
        assertClientDisposition(this.disposition, this.problemStatus, this.problemType);
        setPrototypeOf(this, new.target.prototype);
    }

    /**
     * Serializes the error, including its classification.
     * @returns The JSON representation.
     */
    override toJSON(): JSONObject {
        return serializeClassifiedError(this);
    }
}

/**
 * Represents an error indicating that an operation cannot be completed due to an invalid state or misconfiguration.
 *
 * @example
 * ```ts
 * throw new IllegalStateError('Storage quota exceeded');
 * ```
 */
export class IllegalStateError extends FrameworkError {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'IllegalStateError';
    }

    /**
     * Creates an instance of IllegalStateError.
     * @param message - The error message. Defaults to 'Unable to complete operation due to misconfiguration'.
     * @param options - Standard `Error` options plus the classification; pass
     *   `{ cause }` to preserve the original failure across the framework
     *   boundary (e.g. `Application.run()` startup failures).
     */
    constructor(message: string = 'Unable to complete operation due to misconfiguration', options?: NdigoErrorOptions) {
        super(message, options);
        this.name = 'IllegalStateError';
    }
}
