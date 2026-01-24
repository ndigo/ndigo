/**
 * @author Jeff Rose
 */
import { serializable } from '@blue/core';
export type Params<T = any> = {
    value?: T;
};
export type ValidationResults<T = serializable, U = any> = {
    name: string;
    params: Params<U>;
    value: T;
    isValid: boolean;
    violations: Constraint<T>[];
};
export type constraint<T = serializable> = (params: Params, value: T) => boolean;
export interface Constraint<T = serializable> {
    validate: constraint<T>;
}
export declare class CompositeConstraint<T = serializable> implements Constraint<T> {
    constraints: Constraint<T>[];
    constructor(constraints: Constraint<T>[]);
    validate(params: Params, value: T): boolean;
}
//# sourceMappingURL=constraint.d.ts.map