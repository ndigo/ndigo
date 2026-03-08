/**
 * @author Jeff Rose
 */
import Type, { ValidationResults } from './type';
import { ValidationOptions } from './type';
import { serializable } from '@blue/core';
import { TypeDefinition } from './types';
import { ValidationBackendAdapter } from './_validation-backend-adapter';

const defineProperty = Reflect.defineProperty;

export interface Validator {
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

export default class TypeValidator implements Validator {
    readonly types: Map<string, Type>;
    readonly backend: ValidationBackendAdapter;

    constructor(types: Record<string, TypeDefinition>, backend?: ValidationBackendAdapter) {
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

        this.register(types, backend);
    }

    register(types: Record<string, TypeDefinition>, backend = this.backend): void {
        for (const name in types) {
            this.types.set(name, new Type(name, types[name], backend));
        }
    }

    availableTypes(): string[] {
        return Array.from(this.types.keys());
    }

    hasType(name: string): boolean {
        return this.types.has(name);
    }

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
