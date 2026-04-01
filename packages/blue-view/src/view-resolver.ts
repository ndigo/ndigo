/**
 * @author Jeff Rose
 */

import { View, AbstractPathBasedView } from './view';
import { createNull, MediaType, MediaTypes, Null, Constructable } from '@blue/core';
import { Initializable, likeInitializable } from '@blue/factory';
import { ApplicationContext, AsApplicationContextAware, likeApplicationContextAware } from '@blue/context';

/**
 * Should ViewResolver be typed, i.e. ViewResolver<T extends View>?
 * -JBR
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
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    resolveViewName(name: string, language?: any): Promise<View>;
}

/**
 * @implements module:view.View
 */
class UnresolvedView implements View {
    readonly mediaType: MediaType = null;

    render(model: any, request: any): void {
        return;
    }
}

const defineProperty = Reflect.defineProperty,
    unresolvedView: View = new UnresolvedView();

export abstract class AbstractCachingViewResolver implements ViewResolver {
    /**
     * Cached views keyed by name and language.
     */
    readonly cache: { [key: string]: View };
    /**
     * Indicates whether resolved views should be cached.
     */
    isCaching: boolean;

    /**
     * Creates a resolver with an empty cache.
     */
    constructor() {
        defineProperty(this, 'cache', {
            value: createNull(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.isCaching = true;
    }

    /**
     * Resolves the requested view name, optionally using the cache.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint used during resolution.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    async resolveViewName(name: string, language?: any): Promise<View> {
        let view: View;
        if (!this.isCaching) {
            view = await this._createView(name, language);
        } else {
            const key: string = this._createCacheKey(name, language);
            view = this.cache[key];
            if (!view) {
                view = await this._createView(name, language);
                if (!view) {
                    view = unresolvedView;
                } else {
                    this.cache[key] = view;
                }
            }
        }
        return view === unresolvedView ? null : view;
    }

    protected async _createView(name: string, language?: any): Promise<View> {
        return this._loadView(name, language);
    }

    protected _createCacheKey(name: string, language?: any): string {
        return `${name}${language ? '_' + language : ''}`;
    }

    protected abstract _loadView(name: string, language?: any): Promise<View>;
}

export abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    /**
     * Media type assigned to resolved views.
     */
    mediaType: MediaType;
    /**
     * Prefix applied before the resolved view name.
     */
    prefix: string;
    /**
     * Suffix applied after the resolved view name.
     */
    suffix: string;
    /**
     * The concrete view class that will be instantiated.
     */
    viewClass: Constructable<View>;
    /**
     * The set of names this resolver supports.
     */
    viewNames: (string | RegExp)[];

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
    supports(name: string, language?: any): boolean {
        let isSupported: boolean = !!this.viewNames;

        if (isSupported) {
            isSupported = this.viewNames.some(function (viewName: string | RegExp) {
                if (viewName instanceof RegExp) {
                    return viewName.test(name);
                } else if (typeof viewName === 'string') {
                    return viewName === name;
                }
            });
        }

        return isSupported;
    }

    protected _buildView(name: string): View {
        // TODO Update this to represent how views are really created
        // As a result this could become async
        const ViewClass = this.viewClass,
            view: AbstractPathBasedView = new ViewClass(`${this.prefix}${name}${this.suffix}`) as AbstractPathBasedView;
        view.mediaType = this.mediaType;
        return view;
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
 * @param {string} viewName The name of the view to resolve.
 * @param {*} [language]
 * @returns {module:view.View} The resolved view.
 */

/**
 * Convenient base class for {@link ViewResolver|`ViewResolver`} implementations. Caches {@link View|`View`} instances once resolved.
 * Subclasses need to implement the {@link ViewResolver#loadView|`loadView`} method, building the instance for the specific view name and locale.
 * @abstract
 * @implements module:view.ViewResolver
 * @see {@link ViewResolver#loadView}
 */

/**
 * @abstract
 * @extends module:view.AbstractCachingViewResolver
 */

/**
 * @extends module:view.AbstractPathBasedViewResolver
 */
export class ImportViewResolver extends AbstractPathBasedViewResolver {
    /**
     * Loads a view module dynamically and instantiates its default export.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the imported view instance.
     */
    protected async _loadView(name: string, language?: any): Promise<View> {
        const path: string = `${this.prefix}${name}${this.suffix}`,
            ViewClass: Constructable<View> = await import(/* @vite-ignore */ path).then((module) => module.default);
        return new ViewClass();
    }
}

/**
 * A simple implementation of {@link ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.
 * @implements module:view.ViewResolver
 */
export class NameViewResolver extends AsApplicationContextAware(Null) implements ViewResolver {
    /**
     * The application context used as the view registry.
     */
    readonly applicationContext: ApplicationContext;

    /**
     * Resolves a view from the application context by name.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the matching view, or `null` when none is available.
     */
    async resolveViewName(name: string, language?: any): Promise<View> {
        const { applicationContext } = this;

        let view: View = null;

        // ApplicationContext extends ConfigurableFactory which extends Registry
        // Registry provides hasValue and getValue methods
        if ((applicationContext as any).hasValue(name)) {
            view = (applicationContext as any).getValue(name);
        }

        return await view;
    }
}

/**
 * A {@link ViewResolver|`ViewResolver`} that delegates to others.
 * @implements module:core.Initializable
 * @implements module:core.ViewResolver
 * @see module:context.AsApplicationContextAware
 * @extends module:core.Null
 */
export class ViewResolverComposite extends AsApplicationContextAware(Null) implements Initializable, ViewResolver {
    /**
     * The ordered resolver chain consulted during lookup.
     */
    readonly viewResolvers: ViewResolver[];

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
    init(...args: any[]): void {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeInitializable(viewResolver)) {
                    (viewResolver as any).init(...args);
                }
            }
        }
    }

    /**
     * Resolves the requested view by querying delegates in order.
     *
     * @param name - The view name to resolve.
     * @param language - Optional locale or language hint.
     * @returns A promise that resolves to the first matching view, or `null` when none resolve.
     */
    async resolveViewName(name: string, language?: any): Promise<View> {
        const { viewResolvers } = this;
        const length = viewResolvers.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const viewResolver = viewResolvers[index],
                    view = await viewResolver.resolveViewName(name, language);
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
                    (viewResolver as any).setApplicationContext(applicationContext);
                }
            }
        }
    }
}
