import standardConstraints, { Constraint, ValidationConstraints } from './standard-constraints';

const constraints: ValidationConstraints = {
    ...standardConstraints,
};

/**
 * Registers or replaces a constraint by name.
 */
export const registerConstraint = (name: string, constraint: Constraint): void => {
    if (!name) {
        throw new TypeError('Constraint name is required');
    }

    if (!constraint || typeof constraint.validate !== 'function') {
        throw new TypeError(`Constraint "${name}" must define a validate function`);
    }

    constraints[name] = constraint;
};

/**
 * Unregisters a custom constraint by name.
 */
export const unregisterConstraint = (name: string): void => {
    delete constraints[name];
};

/**
 * Checks whether a constraint has been registered.
 */
export const hasConstraint = (name: string): boolean => Object.prototype.hasOwnProperty.call(constraints, name);

/**
 * Gets a registered constraint by name.
 */
export const getConstraint = (name: string): Constraint => {
    if (!hasConstraint(name)) {
        throw new TypeError(`Constraint "${name}" does not exist`);
    }

    return constraints[name];
};

/**
 * Returns all available constraint names.
 */
export const availableConstraints = (): string[] => Object.keys(constraints);

export default constraints;
