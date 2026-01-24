/**
 * @author Jeff Rose
 */

export interface Validator {
    supports( value ): boolean;
    validate( value ): void;
}
