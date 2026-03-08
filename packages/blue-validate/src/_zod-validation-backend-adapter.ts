/**
 * @author Jeff Rose
 */

import { z } from 'zod';
import { ValidationBackendAdapter } from './_validation-backend-adapter';

type ValidationSchemaFactory = (params?: Record<string, unknown>) => z.ZodTypeAny;

const defaultDateFormat = 'MM/DD/YYYY';

const normalizeDate = (value: unknown, format: string = defaultDateFormat): Date | null => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value !== 'string') {
        return null;
    }

    const text = value.trim();
    if (!text.length) {
        return null;
    }

    if (format !== defaultDateFormat) {
        return null;
    }

    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
    if (!match) {
        return null;
    }

    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);

    if (month < 1 || month > 12) {
        return null;
    }

    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) {
        return null;
    }

    const date = new Date(year, month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
};

const toStartOfDay = (date: Date): number => {
    const normalized = new Date(date.getTime());
    normalized.setHours(0, 0, 0, 0);
    return normalized.getTime();
};

export class ZodValidationBackendAdapter implements ValidationBackendAdapter {
    #schemaByConstraint: Map<string, ValidationSchemaFactory>;

    constructor() {
        this.#schemaByConstraint = new Map<string, ValidationSchemaFactory>([
            ['Email', () => z.string().email()],
            ['URL', () => z.string().url()],
            ['Integer', () => z.string().regex(/^-?[0-9]+$/)],
            ['Numeric', () => z.string().regex(/^-?[0-9]*(\.[0-9]+)?$/)],
            ['Real', () => z.string().regex(/^-?[0-9]*(\.[0-9]+)?$/)],
            ['Alpha', () => z.string().regex(/^[A-Za-z]+$/)],
            ['AlphaNumeric', () => z.string().regex(/^[A-Za-z0-9]+$/)],
            ['Blank', () => z.string().refine((v) => !v.replace(/\s+/g, '').length)],
            ['NotBlank', () => z.string().refine((v) => !!v.replace(/\s+/g, '').length)],
            [
                'Length',
                (params = {}) => {
                    const min = typeof params.min === 'number' ? params.min : undefined;
                    const max = typeof params.max === 'number' ? params.max : undefined;
                    const value = typeof params.value === 'number' ? params.value : undefined;

                    let schema = z.string();
                    if (typeof value === 'number') {
                        schema = schema.min(value).max(value);
                    } else {
                        if (typeof min === 'number') {
                            schema = schema.min(min);
                        }
                        if (typeof max === 'number') {
                            schema = schema.max(max);
                        }
                    }

                    return schema;
                },
            ],
            ['Min', (params = {}) => z.coerce.number().min(Number(params.value))],
            ['Max', (params = {}) => z.coerce.number().max(Number(params.value))],
            [
                'Range',
                (params = {}) => {
                    const min = params.value !== undefined ? Number(params.value) : Number(params.min ?? 0);
                    const max =
                        params.value !== undefined ? Number(params.value) : Number(params.max ?? Number.MAX_VALUE);
                    return z.coerce.number().min(min).max(max);
                },
            ],
            [
                'Enum',
                (params = {}) =>
                    z.any().refine((value) => {
                        const source = params.value;

                        const values =
                            typeof source === 'string' ? source.split(' ') : Array.isArray(source) ? source : [];

                        return values.includes(value as never);
                    }),
            ],
            [
                'Pattern',
                (params = {}) => {
                    const { regex, flags } = params;

                    const matcher =
                        typeof regex === 'string'
                            ? new RegExp(
                                  regex.replace(/^\//, '').replace(/\/$/, ''),
                                  typeof flags === 'string' ? flags : ''
                              )
                            : regex instanceof RegExp
                              ? regex
                              : /$^/;

                    return z.string().regex(matcher);
                },
            ],
            [
                'Date',
                (params = {}) =>
                    z.any().refine((value) => !!normalizeDate(value, String(params.format || defaultDateFormat))),
            ],
            [
                'Past',
                (params = {}) =>
                    z.any().refine((value) => {
                        const date = normalizeDate(value, String(params.format || defaultDateFormat));
                        if (!date) {
                            return false;
                        }

                        return toStartOfDay(date) < toStartOfDay(new Date());
                    }),
            ],
            [
                'Future',
                (params = {}) =>
                    z.any().refine((value) => {
                        const date = normalizeDate(value, String(params.format || defaultDateFormat));
                        if (!date) {
                            return false;
                        }

                        return toStartOfDay(date) > toStartOfDay(new Date());
                    }),
            ],
            [
                'DateRange',
                (params = {}) =>
                    z.any().refine((value) => {
                        const format = String(params.format || defaultDateFormat);
                        const date = normalizeDate(value, format);
                        if (!date) {
                            return false;
                        }

                        const target = toStartOfDay(date);

                        if (params.value !== undefined) {
                            const expected = normalizeDate(params.value, format);
                            return !!expected && toStartOfDay(expected) === target;
                        }

                        if (params.min !== undefined) {
                            const minDate = normalizeDate(params.min, format);
                            if (!minDate || target < toStartOfDay(minDate)) {
                                return false;
                            }
                        }

                        if (params.max !== undefined) {
                            const maxDate = normalizeDate(params.max, format);
                            if (!maxDate || target > toStartOfDay(maxDate)) {
                                return false;
                            }
                        }

                        return true;
                    }),
            ],
            [
                'Digits',
                (params = {}) =>
                    z.string().refine((value) => {
                        const integer = Number(params.integer ?? -1);
                        const fraction = Number(params.fraction ?? -1);

                        if (integer < 0 || fraction < 0) {
                            return false;
                        }

                        const [left, right = ''] = value.replace(/\s+/g, '').split('.');
                        const integerOk = integer === 0 ? true : left.length <= integer;
                        const fractionOk = fraction === 0 ? true : right.length <= fraction;
                        return integerOk && fractionOk;
                    }),
            ],
        ]);
    }

    hasConstraint(name: string): boolean {
        return this.#schemaByConstraint.has(name);
    }

    validateConstraint(name: string, value: unknown, params: Record<string, unknown> = {}): boolean {
        const schemaFactory = this.#schemaByConstraint.get(name);
        if (!schemaFactory) {
            throw new TypeError(`Constraint "${name}" is not implemented by ZodValidationBackendAdapter`);
        }

        return schemaFactory(params).safeParse(value).success;
    }
}
