/**
 * @author Jeff Rose
 */

import { complement } from '@blue/util/logic';
import { equals } from '@blue/util/relation';
import { toString } from '@blue/util/string';
import { is } from '@blue/util/types';
import { TypeDefinition } from './types';
import { ValidationGroup, defaultValidationGroup } from './group';
import { ValidationBackendAdapter } from './_validation-backend-adapter';
import { NativeValidationBackendAdapter } from './_native-validation-backend-adapter';

type ConstraintConfig = TypeDefinition['constraints'][number];
const defaultValidationBackend = new NativeValidationBackendAdapter();

export type ValidationOptions = Record<string, unknown> & {
    groups?: ValidationGroup[];
};

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
    isNotArray = complement(isArray),
    isString = is(String),
    isNotString = complement(isString),
    isUndefined = equals(void 0);

/**
 * @param {string} name
 * @param {Object} definition
 */
class Type {
    readonly name: string;
    readonly constraints: ConstraintConfig[];
    readonly backend: ValidationBackendAdapter;

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
        this.constraints.forEach(function (constraint) {
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
        }, this);
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
     * @param value
     * @param params
     */
    validator(value: unknown, params: ValidationOptions = {}) {
        return this.#resolveConstraints(params).every(function (constraint) {
            // @note param extension is basic (can not extend two different constraints of the same type, use case is to edgy)
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return this.backend.validateConstraint(
                constraint.type,
                value,
                assign({}, constraint.params, params[constraint.type] || params)
            );
        }, this);
    }

    /**
     * @param value
     * @param params
     */
    validate(value: unknown, params: ValidationOptions = {}): ValidationResults {
        isNotArray(value) && isNotString(value) && (value = toString(value) || '');

        // Default to the current type as the constraint in case no constraints were defined but a validator was
        const constraintsConfig = this.#resolveConstraints(params);

        // Not running directly through the validator, because it only returns a boolean and we want a more comprehensive object (the list of failed constraints) while validating
        const failedConstraints = constraintsConfig.filter(function (config) {
            // @note params extension is basic (can not extend two different constraints of the same type, use case is to edgy).
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return !this.backend.validateConstraint(
                config.type,
                value,
                assign({}, config.params, params[config.type] || params)
            );
        }, this);

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
