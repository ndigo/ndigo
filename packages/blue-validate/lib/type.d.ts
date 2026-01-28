/**
 * @author Jeff Rose
 */
type TypeDefinition = {
    constraints: any[];
};
export type ValidationResults = {
    value: any;
    isValid: boolean;
    validationName: string;
    validationParams: any;
    failedConstraints: any;
};
/**
 * @param {string} name
 * @param {Object} definition
 */
declare class Type {
    readonly name: string;
    readonly constraints: any[];
    constructor(name: string, definition: TypeDefinition);
    /**
     * @param value
     * @param params
     */
    validator(value: any, params: any): boolean;
    /**
     * @param value
     * @param params
     */
    validate(value: any, params?: {}): ValidationResults;
}
export default Type;
//# sourceMappingURL=type.d.ts.map