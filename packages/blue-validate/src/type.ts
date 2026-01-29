/**
 * @author Jeff Rose
 */

import constraints from './constraints';
import { complement } from '@blue/util/logic';
import { equals } from '@blue/util/relation';
import { toString } from '@blue/util/string';
import { is } from '@blue/util/types';

type TypeDefinition = {
    constraints: any[];
};

export type ValidationResults = {
    value;
    isValid: boolean;
    validationName: string;
    validationParams;
    failedConstraints;
};

let lang;

const { assign } = Object,
    { defineProperty } = Reflect,
    isArray = Array.isArray,
    isFunction = is(Function),
    isNotArray = complement(isArray),
    isNotFunction = complement(isFunction),
    isString = is(String),
    isNotString = complement(isString),
    isUndefined = equals(void 0),
    // language setting optimization
    clearLang = function () {
        lang = '';
    },
    getLang = function () {
        if (!lang) {
            // set language
            lang = /*settings.get( 'language' ) || settings.get( 'contentLanguage' ) ||*/ 'en-us';
            // clear lang once this thread finishes
            setTimeout(clearLang, 0);
        }
        return lang;
    };

/**
 * @param {string} name
 * @param {Object} definition
 */
class Type {
    readonly name: string;
    readonly constraints: any[];

    constructor(name: string, definition: TypeDefinition) {
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

        // Is this a standard type definition which has constraints
        this.constraints.forEach(function (constraint) {
            if (isUndefined(constraint.type)) {
                throw new TypeError(
                    `Property "type" is undefined for constraints within definition of type "${this.name}"`
                );
            } else if (isUndefined(constraints[constraint.type])) {
                throw new TypeError(
                    `Constraint "${constraint.type}" does not exist, and is being used by type "${this.name}"`
                );
            } else if (isNotFunction(constraints[constraint.type].validate)) {
                throw new TypeError(
                    `Constraint "${constraint.type}" does not have a method "validator", and is being used by type "${this.name}"`
                );
            }
            // Make sure we always have params defined
            constraint.params = constraint.params || {};
        }, this);
    }

    /**
     * @param value
     * @param params
     */
    validator(value, params) {
        const language = getLang();
        return this.constraints.every(function (constraint) {
            // @note param extension is basic (can not extend two different constraints of the same type, use case is to edgy)
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return (constraints[constraint.type][language] || constraints[constraint.type]).validate(
                value,
                assign({}, constraint.params, params[constraint.type] || params)
            );
        }, this);
    }

    /**
     * @param value
     * @param params
     */
    validate(value, params = {}): ValidationResults {
        isNotArray(value) && isNotString(value) && (value = toString(value) || '');

        // Default to the current type as the constraint in case no constraints were defined but a validator was
        const constraintsConfig = this.constraints,
            language = getLang();

        // Not running directly through the validator, because it only returns a boolean and we want a more comprehensive object (the list of failed constraints) while validating
        const failedConstraints = constraintsConfig.filter(function (config) {
            // @note params extension is basic (can not extend two different constraints of the same type, use case is to edgy).
            // @note params extension affect performance
            // @note params will expect to have params specific to the constraint, otherwise it will use the first level params
            return !(constraints[config.type][language] || constraints[config.type]).validate(
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
