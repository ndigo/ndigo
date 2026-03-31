/**
 * @author Jeff Rose
 */

import { FrameworkError, serializable } from '@blue/core';

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

export class CompositeConstraint<T = serializable> implements Constraint<T> {
    constraints: Constraint<T>[];

    constructor(constraints: Constraint<T>[]) {
        if (!constraints.length) {
            throw new FrameworkError('"constraints" cannot be empty');
        }

        Reflect.defineProperty(this, 'constraints', {
            value: constraints,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    validate(params: Params, value: T): boolean {
        let valid = false,
            violations: Constraint<T>[] = [];

        const constraints = this.constraints,
            validateConstraint = (constraint: Constraint<T>): boolean => {
                const result = constraint.validate(params, value);
                if (!result) {
                    violations.push(constraint);
                }
                return result;
            };

        if (Array.isArray(constraints) && constraints.length) {
            valid =
                constraints.length === 1 ? validateConstraint(constraints[0]) : constraints.every(validateConstraint);
        }

        return valid;
    }
}
