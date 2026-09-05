/**
 * @author Jeff Rose
 */

import { Serializable, JSONObject } from './serializable.js';
import { createNull } from './null.js';
import { Constructable } from './constructable.js';

const { setPrototypeOf } = Reflect;

/**
 * A mixin that adds serialization capabilities to an Error class, allowing it to be converted to a JSON object.
 * @template T - The constructor type of the Error class to extend.
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
 * Represents a general application-level error.
 * @extends Error
 * @implements Serializable
 */
export class ApplicationError extends AsSerializableError(Error) {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'ApplicationError';
    }

    /**
     * Creates an instance of ApplicationError.
     * Uses `new.target.name` so subclasses inherit the correct name automatically.
     * @param message - The error message.
     */
    constructor(message?: string) {
        super(message);
        this.name = new.target.name;
        setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Represents an error within the framework itself.
 * @extends Error
 * @implements Serializable
 */
export class FrameworkError extends AsSerializableError(Error) {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'FrameworkError';
    }

    /**
     * Creates an instance of FrameworkError.
     * Uses `new.target.name` so subclasses inherit the correct name automatically.
     * @param message - The error message.
     * @param options - Standard `Error` options; `{ cause }` preserves the
     *   original failure (e.g. across `Application.run()` startup failures).
     */
    constructor(message?: string, options?: ErrorOptions) {
        super(message, options);
        this.name = new.target.name;
        setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * Represents an error indicating that an operation cannot be completed due to an invalid state or misconfiguration.
 * @extends FrameworkError
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
     * @param options - Standard `Error` options; pass `{ cause }` to preserve
     *   the original failure across the framework boundary
     *   (e.g. `Application.run()` startup failures).
     */
    constructor(message: string = 'Unable to complete operation due to misconfiguration', options?: ErrorOptions) {
        super(message, options);
        this.name = 'IllegalStateError';
    }
}

/**
 * * Developer Notes
 * This is the beginning of an error and exception strategy but I am not sure what error subclasses should exist yet. There should likely be a
 * DomainError subclass declared in the blue-domain package. Having these different classes could help provide ways of managing errors in the
 * ErrorHandler class in blue-dispatcher.
 */
