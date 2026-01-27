/**
 * @author Jeff Rose
 */
import { Serializable } from './serializable';
import { Constructable } from './constructable';
export declare const AsSerializableError: <T extends Constructable<Error>>(superclass: T) => Constructable<Serializable> & T;
declare const ApplicationError_base: Constructable<Serializable> & ErrorConstructor;
export declare class ApplicationError extends ApplicationError_base {
    get [Symbol.toStringTag](): string;
    constructor(message?: string);
}
declare const FrameworkError_base: Constructable<Serializable> & ErrorConstructor;
export declare class FrameworkError extends FrameworkError_base {
    get [Symbol.toStringTag](): string;
    constructor(message?: string);
}
/**
 * @extends module:core.FrameworkError
 */
export declare class IllegalStateError extends FrameworkError {
    get [Symbol.toStringTag](): string;
    constructor(message?: string);
}
export {};
/**
 * * Developer Notes
 * This is the beginning of an error and exception strategy but I am not sure what error subclasses should exist yet. There should likely be a
 * DomainError subclass declared in the blue-domain package. Having these different classes could help provide ways of managing errors in the
 * ErrorHandler class in blue-dispatcher.
 */
//# sourceMappingURL=error.d.ts.map