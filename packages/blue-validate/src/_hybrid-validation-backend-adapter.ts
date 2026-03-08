/**
 * @author Jeff Rose
 */

import { ValidationBackendAdapter } from './_validation-backend-adapter';
import { NativeValidationBackendAdapter } from './_native-validation-backend-adapter';
import { ZodValidationBackendAdapter } from './_zod-validation-backend-adapter';

export class HybridValidationBackendAdapter implements ValidationBackendAdapter {
    #primary: ValidationBackendAdapter;
    #fallback: ValidationBackendAdapter;

    constructor(
        primary: ValidationBackendAdapter = new ZodValidationBackendAdapter(),
        fallback: ValidationBackendAdapter = new NativeValidationBackendAdapter()
    ) {
        this.#primary = primary;
        this.#fallback = fallback;
    }

    hasConstraint(name: string): boolean {
        return this.#primary.hasConstraint(name) || this.#fallback.hasConstraint(name);
    }

    validateConstraint(name: string, value: unknown, params: Record<string, unknown> = {}): boolean {
        if (this.#primary.hasConstraint(name)) {
            return this.#primary.validateConstraint(name, value, params);
        }

        return this.#fallback.validateConstraint(name, value, params);
    }
}
