/**
 * @author Jeff Rose
 */

import { Serializable, JSONObject } from './serializable';
import { createNull } from './null';
import { Constructable } from './constructable';

const { setPrototypeOf } = Reflect;

export const AsSerializableError = <T extends Constructable<Error>>(superclass: T): Constructable<Serializable> & T =>
    class extends superclass implements Serializable {
        toJSON(): JSONObject {
            const json = createNull();
            json.name = this.name;
            json.message = this.message;
            json.stack = this.stack;
            return json;
        }

        toString(): string {
            return this.message;
        }
    };

export class ApplicationError extends AsSerializableError(Error) {
    get [Symbol.toStringTag](): string {
        return 'ApplicationError';
    }

    constructor(message?: string) {
        super(message);
        this.name = 'ApplicationError';
        setPrototypeOf(this, new.target.prototype);
    }
}

export class FrameworkError extends AsSerializableError(Error) {
    get [Symbol.toStringTag](): string {
        return 'FrameworkError';
    }

    constructor(message?: string) {
        super(message);
        this.name = 'FrameworkError';
        setPrototypeOf(this, new.target.prototype);
    }
}

/**
 * @class module:core.IllegalStateError
 * @extends module:core.FrameworkError
 */
export class IllegalStateError extends FrameworkError {
    get [Symbol.toStringTag](): string {
        return 'IllegalStateError';
    }

    constructor(message: string = 'Unable to complete operation due to misconfiguration') {
        super(message);
    }
}

/**
 * * Developer Notes
 * This is the beginning of an error and exception strategy but I am not sure what error subclasses should exist yet. There should likely be a
 * DomainError subclass declared in the blue-domain package. Having these different classes could help provide ways of managing errors in the
 * ErrorHandler class in blue-dispatcher.
 */
