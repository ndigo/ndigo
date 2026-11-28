/**
 * Caching base for view resolvers.
 */
import { MediaType } from '@ndigo/core';
import type { View } from './view.js';
import type { ViewResolver } from './view-resolver.js';
import { BoundedCache, MAX_VIEW_CACHE_ENTRIES, createViewCacheKey } from './view-cache.js';

class UnresolvedView implements View {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "UnresolvedView".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object UnresolvedView]"
     */
    get [Symbol.toStringTag](): string {
        return 'UnresolvedView';
    }

    readonly mediaType: MediaType | null = null;

    render(model: unknown, request: unknown): void {
        return;
    }
}

const unresolvedView: View = new UnresolvedView();

/**
 * AbstractCachingViewResolver.
 *
 * @example
 * ```ts
 * const instance = new AbstractCachingViewResolver();
 * ```
 */
export abstract class AbstractCachingViewResolver implements ViewResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "AbstractCachingViewResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object AbstractCachingViewResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'AbstractCachingViewResolver';
    }

    readonly #cache = new BoundedCache<string, View>({ maxSize: MAX_VIEW_CACHE_ENTRIES, policy: 'fifo' });
    /**
     * Indicates whether resolved views should be cached.
     */
    isCaching: boolean;

    /**
     * A read-only mirror of the cached views keyed by name and language.
     */
    get cache(): { [key: string]: View } {
        return this.#cache.toObject();
    }

    /**
     * Creates a resolver with an empty cache.
     */
    constructor() {
        this.isCaching = true;
    }

    /**
     * Resolves the requested view name, optionally using the cache.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint used during resolution.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    async resolveViewName(name: string, language?: unknown): Promise<View | null> {
        let view: View | null;
        if (!this.isCaching) {
            view = await this._createView(name, language);
        } else {
            const key: string = this._createCacheKey(name, language);
            view = this.#cache.get(key) ?? null;
            if (!view) {
                view = await this._createView(name, language);
                if (!view) {
                    view = unresolvedView;
                } else {
                    this.#cache.set(key, view);
                }
            }
        }
        return view === unresolvedView ? null : view;
    }

    /**
     * Creates a view for a name/language pair; the default delegates to
     * {@link AbstractCachingViewResolver._loadView}.
     *
     * @param name - The view name.
     * @param language - Optional language/locale hint.
     * @returns The created view, or `null` when it cannot be created.
     */
    protected async _createView(name: string, language?: unknown): Promise<View | null> {
        return this._loadView(name, language);
    }

    /**
     * Builds an unambiguous cache key for a name/language pair. Delegates to
     * the module-level {@link createViewCacheKey} so every resolver shares one
     * key format.
     *
     * @param name - The view name.
     * @param language - Optional language/locale hint.
     * @returns A collision-free cache key.
     */
    protected _createCacheKey(name: string, language?: unknown): string {
        return createViewCacheKey(name, language);
    }

    /**
     * Loads a view for a name/language pair.
     *
     * @param name - The view name.
     * @param language - Optional language/locale hint.
     * @returns The loaded view, or `null` when it is missing.
     */
    protected abstract _loadView(name: string, language?: unknown): Promise<View | null>;
}
