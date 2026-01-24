/**
 * @author Jeff Rose
 */
import { View } from './view';
import { MediaType, Constructable } from '@blue/core';
import { Initializable } from '@blue/factory';
import { ApplicationContext } from '@blue/context';
/**
 * Should ViewResolver be typed, i.e. ViewResolver<T extends View>?
 * -JBR
 */
export interface ViewResolver {
    resolveViewName(name: string, language?: any): Promise<View>;
}
export declare abstract class AbstractCachingViewResolver implements ViewResolver {
    readonly cache: {
        [key: string]: View;
    };
    isCaching: boolean;
    constructor();
    resolveViewName(name: string, language?: any): Promise<View>;
    protected _createView(name: string, language?: any): Promise<View>;
    protected _createCacheKey(name: string, language?: any): string;
    protected abstract _loadView(name: string, language?: any): Promise<View>;
}
export declare abstract class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    mediaType: MediaType;
    prefix: string;
    suffix: string;
    viewClass: Constructable<View>;
    viewNames: (string | RegExp)[];
    constructor();
    supports(name: string, language?: any): boolean;
    protected _buildView(name: string): View;
}
/**
 * Interface to be implemented by objects that can resolve views by name.
 *
 * View state doesn't change during the running of the application, so implementations are free to cache views.
 *
 * Implementations are encouraged to support internationalization, i.e. localized view resolution.
 * @interface module:view.ViewResolver
 */
/**
 * Resolve the given view by name.
 *
 * To allow for ViewResolver chaining, a ViewResolver should return `null` if a view with the given name is not defined in it.
 * @function module:view.ViewResolver#resolveViewName
 * @param {external:string} viewName The name of the view to resolve.
 * @param {*} [language]
 * @returns {module:view.View} The resolved view.
 */
/**
 * Convenient base class for {@link module:view.ViewResolver|`ViewResolver`} implementations. Caches {@link module:view.View|`View`} instances once resolved.
 * Subclasses need to implement the {@link module:view.ViewResolver#loadView|`loadView`} method, building the instance for the specific view name and locale.
 * @abstract
 * @class module:view.AbstractCachingViewResolver
 * @implements module:view.ViewResolver
 * @see {@link module:view.ViewResolver#loadView}
 */
/**
 * @abstract
 * @class module:view.AbstractPathBasedViewResolver
 * @extends module:view.AbstractCachingViewResolver
 */
/**
 * @class module:view.ImportViewResolver
 * @extends module:view.AbstractPathBasedViewResolver
 */
export declare class ImportViewResolver extends AbstractPathBasedViewResolver {
    protected _loadView(name: string, language?: any): Promise<View>;
}
declare const NameViewResolver_base: any;
/**
 * A simple implementation of {@link module:view.ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.
 * @class module:view.NameViewResolver
 * @implements module:view.ViewResolver
 */
export declare class NameViewResolver extends NameViewResolver_base implements ViewResolver {
    readonly applicationContext: ApplicationContext;
    resolveViewName(name: string, language?: any): Promise<View>;
}
declare const ViewResolverComposite_base: any;
/**
 * A {@link module:view.ViewResolver|`ViewResolver`} that delegates to others.
 * @class module:view.ViewResolverComposite
 * @implements module:core.Initializable
 * @implements module:core.ViewResolver
 * @mixes module:context.AsApplicationContextAware
 * @extends module:core.Null
 */
export declare class ViewResolverComposite extends ViewResolverComposite_base implements Initializable, ViewResolver {
    readonly viewResolvers: ViewResolver[];
    constructor(viewResolvers?: ViewResolver[]);
    init(...args: any[]): void;
    resolveViewName(name: string, language?: any): Promise<View>;
    setApplicationContext(applicationContext: ApplicationContext): void;
}
export {};
//# sourceMappingURL=view-resolver.d.ts.map