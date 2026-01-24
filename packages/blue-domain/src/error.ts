/**
 * @author Jeff Rose
 */

import { AsSerializableError } from '@blue/core';

const { setPrototypeOf } = Reflect;

export class DomainError extends AsSerializableError(Error) {
    get [Symbol.toStringTag](): string {
        return 'DomainError';
    }

    constructor(message?: string) {
        super(message);
        setPrototypeOf(this, new.target.prototype);
    }
}
