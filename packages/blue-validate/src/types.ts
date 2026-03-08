/**
 * @author Jeff Rose
 */
import standardTypes from './standard-types';
import { ValidationGroup } from './group';

type TypeDefinition = {
    constraints: Array<{
        type: string;
        params?: Record<string, unknown>;
        groups?: ValidationGroup[];
    }>;
};

const types: Record<string, TypeDefinition> = {
    ...standardTypes,
};

/**
 * Registers or replaces a type by name.
 */
export const registerType = (name: string, definition: TypeDefinition): void => {
    if (!name) {
        throw new TypeError('Type name is required');
    }

    if (!definition || !Array.isArray(definition.constraints)) {
        throw new TypeError(`Type "${name}" must define a constraints array`);
    }

    types[name] = definition;
};

/**
 * Unregisters a custom type by name.
 */
export const unregisterType = (name: string): void => {
    delete types[name];
};

/**
 * Checks whether a type has been registered.
 */
export const hasType = (name: string): boolean => Object.prototype.hasOwnProperty.call(types, name);

/**
 * Gets a registered type by name.
 */
export const getType = (name: string): TypeDefinition => {
    if (!hasType(name)) {
        throw new TypeError(`Type "${name}" does not exist`);
    }

    return types[name];
};

/**
 * Returns all available type names.
 */
export const availableTypes = (): string[] => Object.keys(types);

export type { TypeDefinition };

export default types;
