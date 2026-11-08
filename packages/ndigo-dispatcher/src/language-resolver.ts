/**
 * Language resolution contracts.
 */

import { normalizeLocale, parseAcceptLanguage } from '@ndigo/content';
import { ACCEPT_LANGUAGE_ATTRIBUTE, Route } from '@ndigo/router';

/**
 * Resolves the active language for a route.
 */
export interface LanguageResolver {
    /**
     * Resolve the language to use for the current route.
     *
     * @param route - The current route.
     * @returns The resolved language tag.
     */
    resolveLanguage(route: Route): string;
}

/**
 * Base class for language resolvers with a configurable fallback language.
 */
export abstract class AbstractLanguageResolver implements LanguageResolver {
    /**
     * Fallback language used when no route-specific language is available.
     */
    readonly defaultLanguage!: string;

    /**
     * Store the fallback language.
     *
     * @param defaultLanguage - The default language to use.
     */
    constructor(defaultLanguage: string) {
        Reflect.defineProperty(this, 'defaultLanguage', {
            value: defaultLanguage,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Resolve the active language for a route.
     *
     * @param route - The current route.
     * @returns The resolved language tag.
     */
    abstract resolveLanguage(route: Route): string;
}

/**
 * Resolves language from the browser's `navigator` object.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage
 */
export class NavigatorLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag](): string {
        return 'NavigatorLanguageResolver';
    }

    /**
     * Resolve the browser language, falling back to the configured default when needed.
     *
     * @param _route - The current route.
     * @returns The browser language or the configured default language.
     */
    resolveLanguage(_route: Route): string {
        if (typeof navigator !== 'undefined') {
            return navigator.language ?? navigator.languages?.[0] ?? this.defaultLanguage;
        }

        return this.defaultLanguage;
    }
}

/**
 * Always resolves the configured fallback language.
 */
export class FixedLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag](): string {
        return 'FixedLanguageResolver';
    }

    /**
     * Resolve the configured language for every route.
     *
     * @param _route - The current route.
     * @returns The configured language.
     */
    resolveLanguage(_route: Route): string {
        return this.defaultLanguage;
    }
}

/**
 * Resolves the primary language from the request's `Accept-Language` header.
 *
 * Reads {@link ACCEPT_LANGUAGE_ATTRIBUTE} from the route — set by platform
 * adapters — and parses it with the shared `parseAcceptLanguage` helper
 * (first q-weighted tag). Falls back to the configured default when the
 * header is absent, unparsable, or `*`.
 */
export class AcceptHeaderLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag](): string {
        return 'AcceptHeaderLanguageResolver';
    }

    /**
     * Resolve the language from the route's accept-language attribute.
     *
     * @param route - The current route.
     * @returns The negotiated language or the configured default.
     */
    resolveLanguage(route: Route): string {
        const header = route.attributes?.[ACCEPT_LANGUAGE_ATTRIBUTE];
        if (typeof header === 'string') {
            const parsed = parseAcceptLanguage(header);
            // Normalize (rejecting junk and `*`): only well-formed BCP 47
            // tags may flow into views, formatters, and generated markup.
            const normalized = normalizeLocale(parsed);
            if (normalized) {
                return normalized;
            }
        }

        return this.defaultLanguage;
    }
}

/**
 * * Developer Notes
 * ? How does CXO determine language/locale today? We should re-implement that logic as a LanguageResolver.
 */
