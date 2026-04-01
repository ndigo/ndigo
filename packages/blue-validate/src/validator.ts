/**
 * @author Jeff Rose
 */
import Type, { ValidationResults } from './type';
import { ValidationOptions } from './type';
import { serializable } from '@blue/core';
import { TypeDefinition } from './types';
import { ValidationBackendAdapter } from './_validation-backend-adapter';
import { createValidationBackend, ValidationBackendName } from './backend';

const defineProperty = Reflect.defineProperty;

/**
 * Defines the interface for a validator, capable of validating a serializable value against a named type.
 */
export interface Validator {
    /**
     * Validates a given value against a specified type.
     * @param {serializable} value - The value to validate.
     * @param {string} name - The name of the validation type to use.
     * @param {ValidationOptions} [params] - Optional parameters for the validation process.
     * @returns {ValidationResults} The results of the validation.
     */
    validate(value: serializable, name: string, params?: ValidationOptions): ValidationResults;
}

/*
export class ConstraintValidator implements Validator {
    readonly constraints: Map<string, Constraint>;

    constructor( constraints: ValidationConstraints ){
        defineProperty( this, 'constraints', {
            value: new Map<string, Constraint>(),
            configurable: true,
            enumerable: false,
            writable: false
        } );
        this.register( constraints );
    }

    register( constraints ){
        for( const name in constraints ){
            this.constraints.set( name, constraints[ name ] );
        }
    }

    validate( value: serializable, name: string, params: Params ): ValidationResults {
        this.constraints.
    }

}
*/

/**
 * A concrete implementation of the `Validator` interface that manages and validates against predefined types.
 * It supports different validation backends (native, Zod, hybrid) for flexible validation strategies.
 */
export default class TypeValidator implements Validator {
    readonly types: Map<string, Type>;
    readonly backend: ValidationBackendAdapter;

    /**
     * Creates an instance of `TypeValidator`.
     * @param {Record<string, TypeDefinition>} types - A map of type names to their definitions.
     * @param {ValidationBackendAdapter | ValidationBackendName} [backendOrName='native'] - The validation backend adapter instance or its name.
     */
    constructor(
        types: Record<string, TypeDefinition>,
        backendOrName?: ValidationBackendAdapter | ValidationBackendName
    ) {
        const backend = typeof backendOrName === 'string' ? createValidationBackend(backendOrName) : backendOrName;

        defineProperty(this, 'types', {
            value: new Map<string, Type>(),
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

        this.register(types, this.backend);
    }

    /**
     * Registers multiple type definitions with the validator.
     * @param {Record<string, TypeDefinition>} types - An object mapping type names to their definitions.
     * @param {ValidationBackendAdapter} [backend=this.backend] - The validation backend to use for these types. Defaults to the validator's configured backend.
     */
    register(types: Record<string, TypeDefinition>, backend = this.backend): void {
        for (const name in types) {
            this.types.set(name, new Type(name, types[name], backend));
        }
    }

    /**
     * Returns an array of all currently registered type names.
     * @returns {string[]} An array of type names.
     */
    availableTypes(): string[] {
        return Array.from(this.types.keys());
    }

    /**
     * Checks if a type with the given name is registered.
     * @param {string} name - The name of the type to check.
     * @returns {boolean} True if the type is registered, false otherwise.
     */
    hasType(name: string): boolean {
        return this.types.has(name);
    }

    /**
     * Validates a given value against a specified registered type.
     * @param {serializable} value - The value to validate.
     * @param {string} name - The name of the validation type to use.
     * @param {ValidationOptions} [params={}] - Optional parameters for the validation process.
     * @returns {ValidationResults} The results of the validation.
     * @throws {TypeError} If the specified type does not exist.
     */
    validate(value: serializable, name: string, params: ValidationOptions = {}): ValidationResults {
        // Is the type defined?
        if (!this.hasType(name)) {
            throw new TypeError(`Type "${name}" does not exist`);
        }

        const // Get the type
            type = this.types.get(name),
            // Get the results of validation
            results = type.validate(value, params);

        return results;
    }
}

/**
 * Factory function to create a new `TypeValidator` instance.
 * @param {Record<string, TypeDefinition>} types - An object mapping type names to their definitions.
 * @param {ValidationBackendName} [backend='native'] - The name of the validation backend to use.
 * @returns {TypeValidator} A new `TypeValidator` instance.
 */
export const createTypeValidator = (
    types: Record<string, TypeDefinition>,
    backend: ValidationBackendName = 'native'
): TypeValidator => new TypeValidator(types, backend);
