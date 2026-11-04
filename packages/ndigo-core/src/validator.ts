/**
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface Validator {
    supports(value: unknown): boolean;
    validate(value: unknown): void;
}
