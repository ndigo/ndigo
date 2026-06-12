/**
 * @author Jeff Rose
 */

import { toString } from '@blue/util/string';
import { is } from '@blue/util/types';
import { TypeDefinition } from './types';
import { ValidationGroup, defaultValidationGroup } from './group';
import { ValidationBackendAdapter } from './_validation-backend-adapter';
import { NativeValidationBackendAdapter } from './_native-validation-backend-adapter';

type ConstraintConfig = TypeDefinition['constraints'][number];
const defaultValidationBackend = new NativeValidationBackendAdapter();

/**
 * Options that can be passed to a validation operation.
 * @property {ValidationGroup[]} [groups] - An array of validation groups to apply. If not provided, the default group will be used.
 */
export type ValidationOptions = Record<string, unknown> & {
    groups?: ValidationGroup[];
};

/**
 * The detailed results returned after validating a value against a `Type` definition.
 * @property {unknown} value - The value that was validated.
 * @property {boolean} isValid - True if the validation passed, false otherwise.
 * @property {string} validationName - The name of the `Type` definition used for validation.
 * @property {ValidationOptions} validationParams - The options used during the validation process.
 * @property {ConstraintConfig[]} failedConstraints - An array of constraint configurations that failed validation.
 */
export type ValidationResults = {
    value: unknown;
    isValid: boolean;
    validationName: string;
    validationParams: ValidationOptions;
    failedConstraints: ConstraintConfig[];
};

const { assign } = Object,
    { defineProperty } = Reflect,
    isArray = Array.isArray,
    isNotArray = (value: unknown) => !isArray(value),
    isString = is(String),
    isNotString = (value: unknown) => !isString(value),
    isUndefined = (value: unknown): boolean => value === undefined;

/**
 * Represents a reusable validation type, encapsulating a set of constraints and a validation backend.
 * This class allows for defining complex validation rules that can be applied to various values.
 */
class Type {
    readonly name!: string;
    readonly constraints!: ConstraintConfig[];
    readonly backend!: ValidationBackendAdapter;

    /**
     * Creates an instance of `Type`.
     * @param {string} name - The name of this validation type.
     * @param {TypeDefinition} definition - The definition of the type, including its constraints.
     * @param {ValidationBackendAdapter} [backend=defaultValidationBackend] - The validation backend to use for this type.
     * @throws {TypeError} If `definition.constraints` is not an array, or if any constraint within the definition is invalid or unregistered.
     */
    constructor(
        name: string,
        definition: TypeDefinition,
        backend: ValidationBackendAdapter = defaultValidationBackend
    ) {
        // Ensure the list of constraints is provided
        if (isNotArray(definition.constraints)) {
            throw new TypeError(`Property "constraints" must be provided for type: ${name}`);
        }

        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'constraints', {
            value: definition.constraints,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'backend', {
            value: backend,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        // Is this a standard type definition which has constraints
        this.constraints.forEach((constraint) => {
            if (isUndefined(constraint.type)) {
                throw new TypeError(
                    `Property "type" is undefined for constraints within definition of type "${this.name}"`
                );
            } else if (!this.backend.hasConstraint(constraint.type)) {
                throw new TypeError(
                    `Constraint "${constraint.type}" does not exist, and is being used by type "${this.name}"`
                );
            }
            // Make sure we always have params defined
            constraint.params = constraint.params || {};
        });
    }

    #resolveConstraints(params: ValidationOptions): ConstraintConfig[] {
        const groups = Array.isArray(params.groups) ? params.groups : [defaultValidationGroup];

        return this.constraints.filter((constraint) => {
            if (!Array.isArray(constraint.groups) || !constraint.groups.length) {
                return true;
            }

            return constraint.groups.some((group) => groups.includes(group));
        });
    }

    /**
     * Checks if a value is valid according to the type's constraints.
     * This method returns a boolean indicating overall validity.
     * @param {unknown} value - The value to validate.
     * @param {ValidationOptions} [params={}] - Optional parameters for the validation process, including active groups.
     * @returns {boolean} True if the value passes all applicable constraints, false otherwise.
     */
    validator(value: unknown, params: ValidationOptions = {}) {
        return this.#resolveConstraints(params).every((constraint) => {
            // @note param extension is basic (can not extend two different constraints of the same type, use case is to edgy)
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return this.backend.validateConstraint(
                constraint.type,
                value,
                assign({}, constraint.params, params[constraint.type] || params)
            );
        });
    }

    /**
     * Validates a value against the type's constraints and returns detailed results.
     * This method provides a comprehensive object including validity status and a list of failed constraints.
     * @param {unknown} value - The value to validate.
     * @param {ValidationOptions} [params={}] - Optional parameters for the validation process, including active groups.
     * @returns {ValidationResults} An object containing the validation outcome, including `isValid` and `failedConstraints`.
     */
    validate(value: unknown, params: ValidationOptions = {}): ValidationResults {
        // Convert non-array, non-string values to strings for validation
        if (isNotArray(value) && isNotString(value)) {
            // Use a simple string conversion that handles null/undefined properly
            const strValue = String(value);
            value = strValue || '';
        }

        // Default to the current type as the constraint in case no constraints were defined but a validator was
        const constraintsConfig = this.#resolveConstraints(params);

        // Not running directly through the validator, because it only returns a boolean and we want a more comprehensive object (the list of failed constraints) while validating
        const failedConstraints = constraintsConfig.filter((config) => {
            // @note params extension is basic (can not extend two different constraints of the same type, use case is to edgy).
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return !this.backend.validateConstraint(
                config.type,
                value,
                assign({}, config.params, params[config.type] || params)
            );
        });

        return {
            value: value,
            isValid: !failedConstraints.length,
            validationName: this.name,
            validationParams: params,
            failedConstraints: failedConstraints,
        };
    }
}

export default Type;