const { defineProperty, setPrototypeOf } = Reflect;

/**
 * Base error class for all validation-related failures.
 * @property {Error} cause - The underlying cause of the validation error, if any.
 */
export class ValidationError extends Error {
    cause: Error;

    get [Symbol.toStringTag](): string {
        return 'ValidationError';
    }

    /**
     * Creates an instance of ValidationError.
     * @param {string} message - A descriptive message for the validation error.
     * @param {Error} [cause] - The original error that caused this validation failure.
     */
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

/**
 * Error thrown when one or more validation constraints are violated.
 */
export class ConstraintViolationError extends ValidationError {
    /**
     * The set of constraint names that were violated.
     */
    readonly violations: ReadonlySet<string>;

    get [Symbol.toStringTag](): string {
        return 'ConstraintViolationError';
    }

    /**
     * Creates an instance of ConstraintViolationError.
     * @param {string} message - A descriptive message for the constraint violation.
     * @param {Set<string>} violations - A set of constraint names that were violated.
     */
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
