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

export interface ViewResolver {
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
    readonly cache: { [key: string]: View };
    isCaching: boolean;

    constructor() {
        defineProperty(this, 'cache', {
            value: createNull(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.isCaching = true;
    }

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
    mediaType: MediaType;
    prefix: string;
    suffix: string;
    viewClass: Constructable<View>;
    viewNames: (string | RegExp)[];

    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JAVASCRIPT;
        this.prefix = '';
        this.suffix = '';
        this.viewNames = null;
    }

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
    readonly applicationContext: ApplicationContext;

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
    readonly viewResolvers: ViewResolver[];

    constructor(viewResolvers: ViewResolver[] = []) {
        super();

        defineProperty(this, 'viewResolvers', {
            value: viewResolvers,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

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
