/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';

export interface LanguageResolver {
    resolveLanguage(route: Route): string;
}

export abstract class AbstractLanguageResolver implements LanguageResolver {
    readonly defaultLanguage: string;

    constructor(defaultLanguage: string) {
        Reflect.defineProperty(this, 'defaultLanguage', {
            value: defaultLanguage,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    abstract resolveLanguage(route: Route): string;
}

/**
 */

/**
 */

/**
 * @abstract
 * @implements {module:dispatcher.LanguageResolver}
 */

/**
 * @extends {module:dispatcher.AbstractLanguageResolver}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage}
 */
export class NavigatorLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag](): string {
        return 'NavigatorLanguageResolver';
    }

    /**
     * @param {module:router.Route} route
     */
    resolveLanguage(route: Route): string {
        let lang: string;

        if (navigator) {
            if (navigator.language) {
                lang = navigator.language;
            } else if (navigator.languages && navigator.languages.length) {
                lang = navigator.languages[0];
            }
        } else {
            lang = this.defaultLanguage;
        }

        // * I think this is the Optional Chaining equivalent to the logic above.
        //lang = navigator?.language || navigator?.languages?.length ? navigator.languages[ 0 ] : this.defaultLanguage;

        return lang;
    }
}

/**
 * * Developer Notes
 * ? How does CXO determine language/locale today? We should re-implement that logic as a LanguageResolver.
 */
