/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';

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
    readonly defaultLanguage: string;

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
 * Resolve language from the browser's `navigator` object.
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
     * @param route - The current route.
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
 * * Developer Notes
 * ? How does CXO determine language/locale today? We should re-implement that logic as a LanguageResolver.
 */
