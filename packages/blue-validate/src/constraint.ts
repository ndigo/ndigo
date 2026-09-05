import { FrameworkError, serializable } from '@blue/core';

/**
 * Represents generic parameters that can be passed to a constraint's validation logic.
 * @template T - The type of the value parameter within the constraint.
 * @property {T} [value] - An optional value parameter for the constraint.
 */
export type Params<T = any> = {
    value?: T;
};

/**
 * Represents the detailed results of a validation operation.
 * @template T - The type of the value that was validated.
 * @template U - The type of parameters used during validation.
 * @property {string} name - The name of the constraint or type that was validated.
 * @property {Params<U>} params - The parameters passed to the validation.
 * @property {T} value - The value that was validated.
 * @property {boolean} isValid - True if the validation passed, false otherwise.
 * @property {Constraint<T>[]} violations - An array of constraints that were violated.
 */
export type ValidationResults<T = serializable, U = any> = {
    name: string;
    params: Params<U>;
    value: T;
    isValid: boolean;
    violations: Constraint<T>[];
};

/**
 * A function type that defines the core validation logic for a constraint.
 * @template T - The type of the value to be validated.
 * @param {Params} params - Parameters for the constraint.
 * @param {T} value - The value to validate.
 * @returns {boolean} True if the value is valid according to the constraint, false otherwise.
 */
export type constraint<T = serializable> = (params: Params, value: T) => boolean;

/**
 * Defines the interface for a validation constraint.
 * @template T - The type of the value that this constraint can validate.
 */
export interface Constraint<T = serializable> {
    /**
     * The validation function for the constraint.
     * @param {Params} params - Parameters for the constraint.
     * @param {T} value - The value to validate.
     * @returns {boolean} True if the value is valid, false otherwise.
     */
    validate: constraint<T>;
}

/**
 * A constraint that combines multiple individual constraints, requiring all of them to pass for overall validity.
 * @template T - The type of the value that this composite constraint can validate.
 */
export class CompositeConstraint<T = serializable> implements Constraint<T> {
    constraints!: Constraint<T>[];

    /**
     * Creates an instance of `CompositeConstraint`.
     * @param {Constraint<T>[]} constraints - An array of constraints to be combined.
     * @throws {FrameworkError} If the `constraints` array is empty.
     */
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

    /**
     * Validates a value against all contained constraints.
     * All constraints must pass for this composite constraint to be considered valid.
     * @param {Params} params - Parameters for the constraint.
     * @param {T} value - The value to validate.
     * @returns {boolean} True if all contained constraints pass, false otherwise.
     */
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
