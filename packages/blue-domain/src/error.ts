import { AsSerializableError } from '@blue/core';

const { setPrototypeOf } = Reflect;

export class DomainError extends AsSerializableError(Error) {
    /**
     * Returns the error tag used by object inspection.
     *
     * @returns The domain error tag.
     */
    get [Symbol.toStringTag](): string {
        return 'DomainError';
    }

    /**
     * Creates a domain-specific error that can be serialized safely.
     *
     * @param message - Optional error message.
     */
    constructor(message?: string) {
        super(message);
        setPrototypeOf(this, new.target.prototype);
    }
}
