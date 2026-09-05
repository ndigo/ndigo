import { describe, test, expect } from 'vitest';
import { ConstraintViolationError } from '../src/error';
import { formatValidationError } from '../src/format';

describe('formatValidationError', () => {
    test('returns constraint names when no content lookup is provided', () => {
        const error = new ConstraintViolationError('failed', new Set(['NotBlank', 'Min']));
        const messages = formatValidationError(error);

        expect(messages).toEqual(['NotBlank', 'Min']);
    });

    test('returns resolved messages from content lookup', () => {
        const error = new ConstraintViolationError('failed', new Set(['NotBlank']));

        const contentLookup = {
            getContent: (key: string, language: string) => {
                if (key === 'validate.constraint.NotBlank' && language === 'en') {
                    return 'Must not be blank';
                }
                return key;
            },
        };

        const messages = formatValidationError(error, contentLookup);
        expect(messages).toEqual(['Must not be blank']);
    });

    test('falls back to constraint name when content lookup returns the key unchanged', () => {
        const error = new ConstraintViolationError('failed', new Set(['Email']));

        const contentLookup = {
            getContent: (key: string) => key, // always returns key — no translation
        };

        const messages = formatValidationError(error, contentLookup);
        expect(messages).toEqual(['Email']);
    });

    test('respects the language parameter', () => {
        const error = new ConstraintViolationError('failed', new Set(['NotBlank']));

        const contentLookup = {
            getContent: (key: string, language: string) => {
                if (key === 'validate.constraint.NotBlank' && language === 'fr') {
                    return 'Ne doit pas être vide';
                }
                return key;
            },
        };

        const messages = formatValidationError(error, contentLookup, 'fr');
        expect(messages).toEqual(['Ne doit pas être vide']);
    });

    test('returns empty array for an error with no violations', () => {
        const error = new ConstraintViolationError('no violations', new Set());
        const messages = formatValidationError(error);
        expect(messages).toEqual([]);
    });
});
