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
 * @class module:validate.Type
 * @param {external:string} name
 * @param {external:Object} definition
 */
declare class Type {
    readonly name: string;
    readonly constraints: any[];
    constructor(name: string, definition: TypeDefinition);
    /**
     * @function module:validate.Type#validator
     * @param value
     * @param params
     */
    validator(value: any, params: any): boolean;
    /**
     * @function module:validate.Type#validate
     * @param value
     * @param params
     */
    validate(value: any, params?: {}): ValidationResults;
}
export default Type;
//# sourceMappingURL=type.d.ts.map