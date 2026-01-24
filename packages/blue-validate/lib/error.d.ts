export declare class ValidationError extends Error {
    cause: Error;
    get [Symbol.toStringTag](): string;
    constructor(message: string, cause?: Error);
}
export declare class ConstraintViolationError extends ValidationError {
    get [Symbol.toStringTag](): string;
    constructor(message: string, violations: Set<string>);
}
//# sourceMappingURL=error.d.ts.map