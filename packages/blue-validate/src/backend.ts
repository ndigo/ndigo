/**
 * @author Jeff Rose
 */

import { NativeValidationBackendAdapter } from './_native-validation-backend-adapter';
import type { ValidationBackendAdapter } from './_validation-backend-adapter';

/**
 * The supported validation backend. Currently only
 * `native` (built-in BlueJS validation) is available.
 */
export type ValidationBackendName = 'native';

/**
 * Creates a backend adapter for validation execution.
 */
export const createValidationBackend = (_name?: ValidationBackendName): ValidationBackendAdapter => {
    return new NativeValidationBackendAdapter();
};
