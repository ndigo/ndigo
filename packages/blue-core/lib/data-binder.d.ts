import { FrameworkError } from './error';
import { MutablePropertyValues, PropertyValues } from './property-value';
export declare class BindError extends FrameworkError {}
export declare class DataBinder {
    #private;
    get requiredFields(): string[];
    set requiredFields(fields: string[]);
    get name(): string;
    get result(): any;
    get target(): any;
    constructor(target: any, name?: string);
    bind(properties: PropertyValues): void;
    validate(): void;
    protected _applyPropertyValues(properties: MutablePropertyValues): void;
    protected _checkRequiredFields(properties: MutablePropertyValues): void;
}
//# sourceMappingURL=data-binder.d.ts.map
