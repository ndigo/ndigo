/**
 * @author Jeff Rose
 */
import { serializable } from '@blue/core';
export type Params<T = any> = {
    value?: T;
};
export type constraint<T = serializable> = (value: T, params?: Params) => boolean;
export type Constraint<T = serializable> = {
    validate: constraint<T>;
};
export type ValidationConstraints = {
    [name: string]: Constraint;
};
/**
 * @namespace module:validate.constraints
 */
declare const standardConstraints: ValidationConstraints;
export default standardConstraints;
//# sourceMappingURL=standard-constraints.d.ts.map