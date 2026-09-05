export interface Validator {
    supports(value: any): boolean;
    validate(value: any): void;
}
