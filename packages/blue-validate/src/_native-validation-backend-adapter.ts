import constraints from './constraints';
import { ValidationBackendAdapter } from './_validation-backend-adapter';

export class NativeValidationBackendAdapter implements ValidationBackendAdapter {
    hasConstraint(name: string): boolean {
        return Object.prototype.hasOwnProperty.call(constraints, name);
    }

    validateConstraint(name: string, value: unknown, params: Record<string, unknown> = {}): boolean {
        if (!this.hasConstraint(name)) {
            throw new TypeError(`Constraint "${name}" does not exist`);
        }

        return constraints[name].validate(value as any, params);
    }
}
