/**
 * @author Jeff Rose
 */

import { ValidationBackendAdapter } from './_validation-backend-adapter';
import { HybridValidationBackendAdapter } from './_hybrid-validation-backend-adapter';
import { NativeValidationBackendAdapter } from './_native-validation-backend-adapter';
import { ZodValidationBackendAdapter } from './_zod-validation-backend-adapter';

export type ValidationBackendName = 'native' | 'zod' | 'hybrid';

/**
 * Creates a backend adapter for validation execution.
 */
export const createValidationBackend = (name: ValidationBackendName = 'native'): ValidationBackendAdapter => {
    if (name === 'zod') {
        return new ZodValidationBackendAdapter();
    }

    if (name === 'hybrid') {
        return new HybridValidationBackendAdapter();
    }

    return new NativeValidationBackendAdapter();
};
