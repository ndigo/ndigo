/**
 * @author Jeff Rose
 */
declare const DomainError_base: import("@blue/core").Constructable<import("@blue/core").Serializable> & ErrorConstructor;
export declare class DomainError extends DomainError_base {
    get [Symbol.toStringTag](): string;
    constructor(message?: string);
}
export {};
//# sourceMappingURL=error.d.ts.map