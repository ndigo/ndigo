const { defineProperty, setPrototypeOf } = Reflect;

export class ValidationError extends Error {
    cause: Error;

    get [Symbol.toStringTag](): string {
        return 'ValidationError';
    }

    constructor(message: string, cause: Error = null) {
        super(`Validation failed: "${message}"`);

        setPrototypeOf(this, new.target.prototype);

        defineProperty(this, 'cause', {
            value: cause,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}

export class ConstraintViolationError extends ValidationError {
    get [Symbol.toStringTag](): string {
        return 'ConstraintViolationError';
    }

    constructor(message: string, violations: Set<string>) {
        super(message);

        defineProperty(this, 'violations', {
            value: violations,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
