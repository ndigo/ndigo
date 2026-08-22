/**
 * @author Jeff Rose
 */
import { Serializable } from './serializable.js';
import { Constructable } from './constructable.js';
/**
 * A mixin that adds serialization capabilities to an Error class, allowing it to be converted to a JSON object.
 * @template T - The constructor type of the Error class to extend.
 * @param superclass - The Error class to extend.
 * @returns A new class that is an Error and also `Serializable`.
 */
export declare const AsSerializableError: <T extends Constructable<Error>>(superclass: T) => Constructable<Serializable> & T;
declare const ApplicationError_base: Constructable<Serializable> & ErrorConstructor;
/**
 * Represents a general application-level error.
 * @extends Error
 * @implements Serializable
 */
export declare class ApplicationError extends ApplicationError_base {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    /**
     * Creates an instance of ApplicationError.
     * Uses `new.target.name` so subclasses inherit the correct name automatically.
     * @param message - The error message.
     */
    constructor(message?: string);
}
declare const FrameworkError_base: Constructable<Serializable> & ErrorConstructor;
/**
 * Represents an error within the framework itself.
 * @extends Error
 * @implements Serializable
 */
export declare class FrameworkError extends FrameworkError_base {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    /**
     * Creates an instance of FrameworkError.
     * Uses `new.target.name` so subclasses inherit the correct name automatically.
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * Represents an error indicating that an operation cannot be completed due to an invalid state or misconfiguration.
 * @extends FrameworkError
 */
export declare class IllegalStateError extends FrameworkError {
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    /**
     * Creates an instance of IllegalStateError.
     * @param message - The error message. Defaults to 'Unable to complete operation due to misconfiguration'.
     */
    constructor(message?: string);
}
export {};
/**
 * * Developer Notes
 * This is the beginning of an error and exception strategy but I am not sure what error subclasses should exist yet. There should likely be a
 * DomainError subclass declared in the blue-domain package. Having these different classes could help provide ways of managing errors in the
 * ErrorHandler class in blue-dispatcher.
 */
