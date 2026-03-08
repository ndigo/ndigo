/**
 * @author Jeff Rose
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
