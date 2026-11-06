/**
 */
import { View } from './view.js';
import { createNull, MediaType, MediaTypes, Null, Constructable } from '@ndigo/core';
import { Initializable, likeInitializable } from '@ndigo/factory';
import { ApplicationContext, AsApplicationContextAware, likeApplicationContextAware } from '@ndigo/context';

/**
 * Should ViewResolver be typed, i.e. `ViewResolver<T extends View>`?
 *
 */

/**
 * Resolves a view name to a concrete {@link View} instance.
 */
export interface ViewResolver {
    /**
     * Resolves the requested view name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint used during resolution.
     * @param request - Optional per-call request (typically the route) carrying
     *   request-scoped data such as the `Accept` header or path extension.
     *   Threaded explicitly by the dispatcher so negotiation never relies on
     *   shared process state; resolvers that do not negotiate ignore it.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null>;
}

class UnresolvedView implements View {
    readonly mediaType: MediaType | null = null;

    render(model: unknown, request: unknown): void {
        return;
    }
}

const defineProperty = Reflect.defineProperty,
    unresolvedView: View = new UnresolvedView();

/**
 * Upper bound on cached views. View names can be request-derived (default
 * route names, path extensions), so an unbounded cache is a memory-growth
 * vector; insertion-ordered FIFO eviction keeps the cache bounded without
 * changing observable resolution for a fixed name set.
 */
export const MAX_VIEW_CACHE_ENTRIES = 1024;

/**
 * Insertion-ordered, bounded FIFO cache.
 *
 * Shared by every view resolver that memoizes request-derived lookups
 * ({@link AbstractCachingViewResolver} and `ContentNegotiationViewResolver`)
 * so the eviction contract is defined once: never more than
 * {@link MAX_VIEW_CACHE_ENTRIES} entries, the oldest key evicted first.
 */
export class BoundedCache<V> {
    readonly #entries = new Map<string, V>();

    /**
     * Number of cached entries.
     */
    get size(): number {
        return this.#entries.size;
    }

    /**
     * Looks up a cached value.
     *
     * @param key - The cache key.
     * @returns The cached value, or `undefined`.
     */
    get(key: string): V | undefined {
        return this.#entries.get(key);
    }

    /**
     * Stores a value, evicting the oldest entry first when a new key would
     * exceed the bound. Re-setting an existing key keeps its position.
     *
     * @param key - The cache key.
     * @param value - The value to cache.
     */
    set(key: string, value: V): void {
        if (!this.#entries.has(key) && this.#entries.size >= MAX_VIEW_CACHE_ENTRIES) {
            const oldest = this.#entries.keys().next().value;
            if (oldest !== undefined) {
                this.#entries.delete(oldest);
            }
        }
        this.#entries.set(key, value);
    }

    /**
     * A null-prototype plain object mirror of the cache entries, preserving
     * insertion order.
     *
     * @returns The entries as a keyed object.
     */
    toObject(): { [key: string]: V } {
        const result = createNull() as { [key: string]: V };
        for (const [key, value] of this.#entries) {
            result[key] = value;
        }
        return result;
    }
}

/**
 * Builds an unambiguous cache key for a view name/language pair.
 *
 * The key MUST distinguish every distinct pair: a naive
 * `\${name}_\${language}` join collides — `('user_en', 'US')` and
 * `('user', 'en_US')` both yield `user_en_US` — and would serve the first
 * resolved view for the second pair. JSON-encoding the tuple preserves the
 * `_` characters inside each component while keeping them separate.
 *
 * @param name - The view name.
 * @param language - Optional language/locale hint.
 * @returns A collision-free cache key.
 */
export function createViewCacheKey(name: string, language?: unknown): string {
    return JSON.stringify([name, language == null ? '' : String(language)]);
}

export abstract class AbstractCachingViewResolver implements ViewResolver {
    readonly #cache = new BoundedCache<View>();
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

    protected abstract _loadView(name: string, language?: unknown): Promise<View | null>;
}

/**
 * Returns whether a view name is safe to interpolate into a resolver path.
 *
 * View names can reach resolvers from request-derived data (default route
 * names, path extensions), so a name must never escape the resolver's
 * `prefix` once joined with it. Rejected forms:
 *
 * - NUL bytes, which truncate paths in native syscalls;
 * - absolute paths (`/x`, `\x`, `C:\x`), which discard the prefix;
 * - any drive specifier (`C:`, `c:`), including drive-relative forms like
 *   `C:foo` that lack a separator after the colon;
 * - any path segment that is `..`, including its matrix-param and
 *   trailing-space spellings (`..;x=1`, `.. `), which climb out of the
 *   prefix.
 *
 * Separators are otherwise allowed so nested names (`admin/user`) keep
 * resolving, and dots inside a segment (`v1.2`, `my.file`) stay valid.
 *
 * This is the single source of truth for the predicate: the resolver class
 * delegates to it, and the `no-unsafe-view-name-literal` lint rule asserts the
 * same vector table so the runtime and lint grammars cannot drift.
 *
 * @param name - The view name to validate.
 * @returns `true` when the name is safe to use as a relative path.
 */
export function isSafeViewName(name: string): boolean {
    if (name.includes('\0')) {
        return false;
    }

    if (name.startsWith('/') || name.startsWith('\\') || /^[a-zA-Z]:/.test(name)) {
        return false;
    }

    // A segment escapes only when, after dropping any matrix-parameter
    // suffix and trailing spaces (Windows), it is exactly `..`.
    return name.split(/[\\/]+/).every((segment) => segment.split(';', 1)[0].replace(/\s+$/, '') !== '..');
}

export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    /**
     * Media type assigned to resolved views.
     */
    mediaType: MediaType | null;
    /**
     * Prefix applied before the resolved view name.
     */
    prefix: string;
    /**
     * Suffix applied after the resolved view name.
     */
    suffix: string;
    /**
     * The set of names this resolver supports.
     */
    viewNames: (string | RegExp)[] | null;

    /**
     * Creates a path-based resolver with JavaScript media type defaults.
     */
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JAVASCRIPT;
        this.prefix = '';
        this.suffix = '';
        this.viewNames = null;
    }

    /**
     * Returns whether this resolver can handle the given view name.
     *
     * @param name - The view name to test.
     * @param language - Optional locale or language hint.
     * @returns `true` when the name is supported; otherwise `false`.
     */
    supports(name: string, language?: unknown): boolean {
        let isSupported: boolean = !!this.viewNames;

        if (isSupported && this.viewNames) {
            const names = this.viewNames;
            isSupported = names.some(function (viewName: string | RegExp) {
                if (viewName instanceof RegExp) {
                    return viewName.test(name);
                } else if (typeof viewName === 'string') {
                    return viewName === name;
                }
            });
        }

        return isSupported;
    }

    /**
     * Returns whether a view name is safe to interpolate into a resolver path.
     *
     * Delegates to the module-level {@link isSafeViewName} predicate — the
     * single source of truth shared with the `no-unsafe-view-name-literal`
     * lint rule.
     *
     * @param name - The view name to validate.
     * @returns `true` when the name is safe to use as a relative path.
     */
    protected isSafeViewName(name: string): boolean {
        return isSafeViewName(name);
    }
}

/**
 * Interface to be implemented by objects that can resolve views by name.
 *
 * View state doesn't change during the running of the application, so implementations are free to cache views.
 *
 * Implementations are encouraged to support internationalization, i.e. localized view resolution.
 */

/**
 * Resolve the given view by name.
 *
 * To allow for ViewResolver chaining, a ViewResolver should return `null` if a view with the given name is not defined in it.
 * @param viewName - The name of the view to resolve.
 * @param language - The locale language (optional).
 * @returns The resolved view.
 */

/**
 * Convenient base class for {@link ViewResolver|`ViewResolver`} implementations. Caches {@link View|`View`} instances once resolved.
 * Subclasses need to implement the {@link AbstractCachingViewResolver#_loadView|`_loadView`} method, building the instance for the specific view name and locale.
 * 

 * @see {@link AbstractCachingViewResolver#_loadView}
 */

export class ImportViewResolver extends AbstractPathBasedViewResolver {
    /**
     * Loads a view module dynamically and instantiates its default export.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the imported view instance, or `null`
     *   when the name is unsafe to import.
     */
    protected async _loadView(name: string, language?: unknown): Promise<View | null> {
        // The module specifier is runtime-selected (a view name from the
        // application, not known at author time), so a static import cannot
        // express it. A request-derived name must never traverse out of the
        // prefix: a `..`/absolute/NUL name is unresolved (not-found), never
        // imported.
        if (!this.isSafeViewName(name)) {
            return null;
        }

        const path: string = `${this.prefix}${name}${this.suffix}`,
            ViewClass: Constructable<View> = await import(/* @vite-ignore */ path).then((module) => module.default);
        return new ViewClass();
    }
}

/**
 * A simple implementation of {@link ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.

 */
export class NameViewResolver extends AsApplicationContextAware(Null) implements ViewResolver {
    /**
     * The application context used as the view registry.
     */
    readonly applicationContext!: ApplicationContext;

    /**
     * Resolves a view from the application context by name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    async resolveViewName(name: string, language?: unknown): Promise<View | null> {
        const { applicationContext } = this;

        let view: View | null = null;

        // ApplicationContext extends ConfigurableFactory which extends Registry
        // Registry provides hasValue and getValue methods
        if (applicationContext.hasValue(name)) {
            view = applicationContext.getValue(name);
        }

        return view;
    }
}

/**
 * A {@link ViewResolver|`ViewResolver`} that delegates to others.
 */
export class ViewResolverComposite extends AsApplicationContextAware(Null) implements Initializable, ViewResolver {
    /**
     * The ordered resolver chain consulted during lookup.
     */
    readonly viewResolvers!: ViewResolver[];

    /**
     * Creates a composite resolver with the given delegate list.
     *
     * @param viewResolvers - The resolvers to query in order.
     */
    constructor(viewResolvers: ViewResolver[] = []) {
        super();

        defineProperty(this, 'viewResolvers', {
            value: viewResolvers,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Initializes any delegates that expose the {@link Initializable} contract.
     *
     * @param args - Initialization arguments forwarded to delegates.
     */
    init(...args: unknown[]): void {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeInitializable(viewResolver)) {
                    viewResolver.init(...args);
                }
            }
        }
    }

    /**
     * Resolves the requested view by querying delegates in order.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @param request - Optional per-call request forwarded to delegates that
     *   negotiate by request data.
     * @returns A promise that resolves to the first matching view, or `null` when none resolve.
     */
    async resolveViewName(name: string, language?: unknown, request?: unknown): Promise<View | null> {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index],
                    // oxlint-disable-next-line no-await-in-loop -- delegates resolve in priority order with first-match-wins; parallelizing would run every delegate and change which view is returned.
                    view = await viewResolver.resolveViewName(name, language, request);
                if (view) {
                    return view;
                }
            }
        }
        return null;
    }

    /**
     * Propagates the application context to context-aware delegates.
     *
     * @param applicationContext - The application context to share.
     */
    setApplicationContext(applicationContext: ApplicationContext) {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeApplicationContextAware(viewResolver)) {
                    viewResolver.setApplicationContext(applicationContext);
                }
            }
        }
    }
}
