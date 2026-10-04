/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { like } from '@blue/util/types';
import { Constructable } from '@blue/core';
import { likeAwareAnd, Aware, AsAware } from '@blue/factory';
import { LanguageCode } from './language-code';

/**
 * Parameters controlling message formatting.
 *
 * The three fields map onto the two message standards the contract supports:
 * named interpolation values (i18next `replace` / ICU `values`), a plural
 * count (i18next plural keys / ICU `plural`), and a variant selector
 * (i18next context suffix / ICU `select`).
 */
export interface MessageParams {
    /**
     * Named interpolation values for `{name}` placeholders.
     */
    values?: Record<string, unknown>;
    /**
     * Plural count — drives i18next `_one`/`_other` keys or ICU plural selection.
     */
    count?: number;
    /**
     * Variant selector — i18next context suffix (e.g. `key_male`) or ICU `select`.
     */
    context?: string;
}

/**
 * Formats messages for a given key and language.
 *
 * Composes a {@link ContentSource}: a message is a formatted content key.
 * Missing messages fall back to the key itself, matching the content layer's
 * fallback convention.
 *
 * @example
 * ```ts
 * const messages = new I18nextMessageSource({ … });
 * await messages.getMessage('greeting', { values: { name: 'Ada' } }, 'en');
 * // → 'Hello, Ada!'
 * await messages.getMessage('items', { count: 3 }, 'en');
 * // → '3 items'  (plural key `items_other`)
 * ```
 */
export interface MessageSource {
    /**
     * Resolves and formats the message for the requested key.
     *
     * Methods are async by default; implementations may be synchronous
     * under the hood.
     *
     * @param key - The message key to resolve.
     * @param params - Optional formatting parameters (interpolation values, plural count, variant).
     * @param language - The language to use; the source's active language when omitted.
     * @returns A promise of the formatted message, or the key itself when no translation exists.
     */
    getMessage(key: string, params?: MessageParams, language?: string | LanguageCode): Promise<string>;
}

/**
 * Marks an object that can receive a message source.
 */
export interface MessageSourceAware extends Aware {
    /**
     * Sets the message source used by the receiver.
     *
     * @param messageSource - The message source to attach.
     */
    setMessageSource(messageSource: MessageSource): void;
}

/**
 * Mixes message-source awareness into a base class.
 *
 * @param superclass - Base class to extend.
 * @returns A subclass that can receive a message source.
 */
export const AsMessageSourceAware = <T extends Constructable>(superclass: T): Constructable<MessageSourceAware> & T =>
    class extends AsAware(superclass) implements MessageSourceAware {
        messageSource: MessageSource | null = null;

        /**
         * Attaches a message source to the instance.
         *
         * @param messageSource - The message source to store.
         */
        setMessageSource(messageSource: MessageSource): void {
            Reflect.defineProperty(this, 'messageSource', {
                value: messageSource,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
    };

/**
 * Tests whether a value looks like a message source.
 *
 * @param value - The value to be tested.
 * @returns Whether the value matches the message source shape.
 */
export const likeMessageSource = like({ getMessage: Function }) as (value: unknown) => value is MessageSource;

/**
 * Tests whether a value looks like message-source-aware state.
 *
 * @param value - The value to be tested.
 * @returns Whether the value can receive a message source.
 */
export const likeMessageSourceAware = likeAwareAnd(like({ setMessageSource: Function })) as (
    value: unknown
) => value is MessageSourceAware;
