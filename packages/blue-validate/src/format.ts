/**
 * @author Jeff Rose
 */

import { ConstraintViolationError } from './error';

/**
 * Minimal interface for resolving localised strings by key and language.
 * Compatible with `ContentSource` from `@blue/content`.
 */
export interface ContentLookup {
    /**
     * Returns the localised string for the given key and language.
     *
     * @param key - The content key to resolve.
     * @param language - The requested language code.
     * @returns The resolved string, or the key itself when no translation exists.
     */
    getContent(key: string, language: string): string;
}

/**
 * Formats the violation names from a {@link ConstraintViolationError} into
 * human-readable strings.
 *
 * When a `contentLookup` is provided each violation name is used as an i18n
 * key (e.g. `"validate.constraint.NotBlank"`).  If the lookup returns the key
 * unchanged (no translation found) the constraint name itself is used instead.
 *
 * @param error - The constraint violation error to format.
 * @param contentLookup - Optional content source for i18n message resolution.
 * @param language - Language code passed to the content lookup. Defaults to `'en'`.
 * @returns An array of human-readable violation messages, one per violated constraint.
 *
 * @example
 * // Without a content source — returns constraint names
 * const messages = formatValidationError(error);
 * // ['NotBlank', 'Min']
 *
 * @example
 * // With a content source
 * const messages = formatValidationError(error, contentSource, 'fr');
 * // ['Ne doit pas être vide', 'Valeur minimale non atteinte']
 */
export const formatValidationError = (
    error: ConstraintViolationError,
    contentLookup?: ContentLookup,
    language = 'en'
): string[] => {
    const violations = Array.from(error.violations);

    if (!contentLookup) {
        return violations;
    }

    return violations.map((name) => {
        const key = `validate.constraint.${name}`;
        const resolved = contentLookup.getContent(key, language);
        return resolved !== key ? resolved : name;
    });
};
