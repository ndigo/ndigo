/**
 * @author Jeff Rose
 */
import type { DOMProvider } from '@blue/dom';
import type { View } from '@blue/view';
import { AbstractCachingViewResolver } from '@blue/view';
import { WicketView } from './wicket-view';
import type { PageConstructor } from './wicket-view';

/**
 * Resolves view names to {@link WicketView} instances by looking up
 * registered Page class constructors.
 *
 * Page classes are registered with {@link registerPage} and cached
 * after first resolution.
 */
export class WicketViewResolver extends AbstractCachingViewResolver {
    #pages: Map<string, PageConstructor> = new Map();
    #dom: DOMProvider;

    get [Symbol.toStringTag](): string {
        return 'WicketViewResolver';
    }

    /**
     * Creates a resolver that will use the given DOM provider
     * when constructing views.
     *
     * @param dom - The DOM provider for template parsing.
     */
    constructor(dom: DOMProvider) {
        super();
        this.#dom = dom;
    }

    /**
     * Registers a Page class constructor under the given view name.
     *
     * @param name - The view name used for resolution.
     * @param pageClass - The Page constructor to associate.
     * @returns This resolver, for chaining.
     */
    registerPage(name: string, pageClass: PageConstructor): this {
        this.#pages.set(name, pageClass);
        return this;
    }

    /**
     * Returns whether a page is registered under the given name.
     *
     * @param name - The view name to check.
     */
    hasPage(name: string): boolean {
        return this.#pages.has(name);
    }

    /**
     * Loads the view for the given name by constructing a `WicketView`
     * from the registered Page class.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale hint (unused currently).
     * @returns The resolved view, or `null` if no page is registered.
     */
    protected async _loadView(name: string, language?: any): Promise<View | null> {
        const pageClass = this.#pages.get(name);
        if (!pageClass) {
            return null;
        }

        return new WicketView(pageClass, this.#dom);
    }
}
