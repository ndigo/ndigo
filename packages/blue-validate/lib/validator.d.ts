/**
 * @author Jeff Rose
 */
import Type, { ValidationResults } from './type';
import { serializable } from '@blue/core';
import { Params } from './standard-constraints';
export interface Validator {
    validate(value: serializable, name: string, params: Params): ValidationResults;
}
export default class TypeValidator {
    readonly types: Map<string, Type>;
    constructor(types: any);
    register(types: any): void;
    availableTypes(): string[];
    hasType(name: string): boolean;
    validate(value: serializable, name: string, params: any): ValidationResults;
}
//# sourceMappingURL=validator.d.ts.map