export interface Validator {
    supports(value: unknown): boolean;
    validate(value: unknown): void;
}
