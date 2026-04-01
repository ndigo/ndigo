/**
 * @author Jeff Rose
 */

/**
 * Represents a unique validation group, identified by a Symbol.
 * Validation groups allow applying constraints conditionally based on the context of validation.
 */
export type ValidationGroup = symbol;

/**
 * Creates or retrieves a named validation group.
 */
export const validationGroup = (name: string): ValidationGroup => Symbol.for(`validate:group:${name}`);

/**
 * Default validation group used when no explicit groups are provided.
 */
export const defaultValidationGroup: ValidationGroup = validationGroup('default');
