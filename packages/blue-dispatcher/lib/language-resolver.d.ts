/**
 * @author Jeff Rose
 */
import { Route } from '@blue/router';
export interface LanguageResolver {
    resolveLanguage(route: Route): string;
}
export declare abstract class AbstractLanguageResolver implements LanguageResolver {
    readonly defaultLanguage: string;
    constructor(defaultLanguage: string);
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
export declare class NavigatorLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag](): string;
    /**
     * @param {module:router.Route} route
     */
    resolveLanguage(route: Route): string;
}
/**
 * * Developer Notes
 * ? How does CXO determine language/locale today? We should re-implement that logic as a LanguageResolver.
 */
//# sourceMappingURL=language-resolver.d.ts.map