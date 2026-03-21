/**
 * @author Jeff Rose
 */

import type { ParameterExtractor, ParameterValueConverter } from '@blue/dispatcher';
import { z } from 'zod';
import { Validator } from './validator';
import { ValidationError, ConstraintViolationError } from './error';

/**
 * Wraps a parameter extractor with a Zod schema for validation and coercion.
 *
 * @example
 * @routeParams({
 *   user: validatedBy(UserSchema, bindValue('query'))
 * })
 */
export function validatedBy<T>(schema: z.ZodType<T>, extractor: ParameterExtractor): ParameterExtractor<T>;

/**
 * Wraps a parameter extractor with a @blue/validate Validator.
 *
 * @example
 * @routeParams({
 *   email: validatedBy(myValidator, 'Email', queryValue('email'))
 * })
 */
export function validatedBy<T>(
    validator: Validator,
    typeName: string,
    extractor: ParameterExtractor
): ParameterExtractor<T>;

export function validatedBy(
    schemaOrValidator: any,
    extractorOrTypeName: any,
    maybeExtractor?: any
): ParameterExtractor {
    const isZod = typeof schemaOrValidator.safeParse === 'function';
    const extractor = isZod ? extractorOrTypeName : maybeExtractor;
    const typeName = isZod ? null : extractorOrTypeName;

    const convert: ParameterValueConverter = (value: any) => {
        if (isZod) {
            const result = schemaOrValidator.safeParse(value);
            if (!result.success) {
                const message = result.error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ');
                throw new ValidationError(message, result.error);
            }
            return result.data;
        } else {
            const result = schemaOrValidator.validate(value, typeName);
            if (!result.isValid) {
                const violations = new Set<string>(result.failedConstraints.map((c: any) => String(c.type)));
                throw new ConstraintViolationError(`Validation failed for type ${typeName}`, violations);
            }
            return value;
        }
    };

    return { ...extractor, convert };
}
