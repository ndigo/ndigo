/**
 * @author Jeff Rose
 */
import { createNull, MediaTypes, Null } from '@blue/core';
import { likeInitializable } from '@blue/factory';
import { AsApplicationContextAware, likeApplicationContextAware } from '@blue/context';
/**
 * @class module:view.UnresolvedView
 * @implements module:view.View
 */
class UnresolvedView {
    mediaType = null;
    render(model, request) {
        return;
    }
}
const defineProperty = Reflect.defineProperty, unresolvedView = new UnresolvedView();
export class AbstractCachingViewResolver {
    cache;
    isCaching;
    constructor() {
        defineProperty(this, 'cache', {
            value: createNull(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.isCaching = true;
    }
    async resolveViewName(name, language) {
        let view;
        if (!this.isCaching) {
            view = await this._createView(name, language);
        }
        else {
            const key = this._createCacheKey(name, language);
            view = this.cache[key];
            if (!view) {
                view = await this._createView(name, language);
                if (!view) {
                    view = unresolvedView;
                }
                else {
                    this.cache[key] = view;
                }
            }
        }
        return view === unresolvedView ? null : view;
    }
    async _createView(name, language) {
        return this._loadView(name, language);
    }
    _createCacheKey(name, language) {
        return `${name}${language ? '_' + language : ''}`;
    }
}
export class AbstractPathBasedViewResolver extends AbstractCachingViewResolver {
    mediaType;
    prefix;
    suffix;
    viewClass;
    viewNames;
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JAVASCRIPT;
        this.prefix = '';
        this.suffix = '';
        this.viewNames = null;
    }
    supports(name, language) {
        let isSupported = !!this.viewNames;
        if (!isSupported) {
            isSupported = this.viewNames.some(function (viewName) {
                if (viewName instanceof RegExp) {
                    return viewName.test(name);
                }
                else if (typeof viewName === 'string') {
                    return viewName === name;
                }
            });
        }
        return isSupported;
    }
    _buildView(name) {
        // TODO Update this to represent how views are really created
        // As a result this could become async
        const ViewClass = this.viewClass, view = new ViewClass(`${this.prefix}${name}${this.suffix}`);
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
export class ImportViewResolver extends AbstractPathBasedViewResolver {
    async _loadView(name, language) {
        const path = `${this.prefix}${name}${this.suffix}`, ViewClass = await import(/* webpackIgnore: true */ path).then((module) => module.default);
        console.log('View', name, ViewClass);
        return new ViewClass();
    }
}
/**
 * A simple implementation of {@link module:view.ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.
 * @class module:view.NameViewResolver
 * @implements module:view.ViewResolver
 */
export class NameViewResolver extends AsApplicationContextAware(Null) {
    applicationContext;
    async resolveViewName(name, language) {
        const { applicationContext } = this;
        let view = null;
        // ApplicationContext extends ConfigurableFactory which extends Registry
        // Registry provides hasValue and getValue methods
        if (applicationContext.hasValue(name)) {
            view = applicationContext.getValue(name);
        }
        return await view;
    }
}
/**
 * A {@link module:view.ViewResolver|`ViewResolver`} that delegates to others.
 * @class module:view.ViewResolverComposite
 * @implements module:core.Initializable
 * @implements module:core.ViewResolver
 * @mixes module:context.AsApplicationContextAware
 * @extends module:core.Null
 */
export class ViewResolverComposite extends AsApplicationContextAware(Null) {
    viewResolvers;
    constructor(viewResolvers = []) {
        super();
        defineProperty(this, 'viewResolvers', {
            value: viewResolvers,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    init(...args) {
        const { viewResolvers } = this;
        length = viewResolvers.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeInitializable(viewResolver)) {
                    viewResolver.init(args);
                }
            }
        }
    }
    async resolveViewName(name, language) {
        const { viewResolvers } = this;
        length = viewResolvers.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                const viewResolver = viewResolvers[index], view = await viewResolver.resolveViewName(name, language);
                if (view) {
                    return view;
                }
            }
        }
        return null;
    }
    setApplicationContext(applicationContext) {
        const { viewResolvers } = this;
        length = viewResolvers.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                const viewResolver = viewResolvers[index];
                if (likeApplicationContextAware(viewResolver)) {
                    viewResolver.setApplicationContext(applicationContext);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3LXJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLFVBQVUsRUFBYSxVQUFVLEVBQUUsSUFBSSxFQUFpQixNQUFNLFlBQVksQ0FBQztBQUNwRixPQUFPLEVBQWlCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pFLE9BQU8sRUFBc0IseUJBQXlCLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFXM0c7OztHQUdHO0FBQ0gsTUFBTSxjQUFjO0lBQ1AsU0FBUyxHQUFjLElBQUksQ0FBQztJQUVyQyxNQUFNLENBQUMsS0FBVSxFQUFFLE9BQVk7UUFDM0IsT0FBTztJQUNYLENBQUM7Q0FDSjtBQUVELE1BQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxjQUFjLEVBQ3pDLGNBQWMsR0FBUyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBRWhELE1BQU0sT0FBZ0IsMkJBQTJCO0lBQ3BDLEtBQUssQ0FBMEI7SUFDeEMsU0FBUyxDQUFVO0lBRW5CO1FBQ0ksY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7WUFDMUIsS0FBSyxFQUFFLFVBQVUsRUFBRTtZQUNuQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxJQUFZLEVBQUUsUUFBYztRQUM5QyxJQUFJLElBQVUsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbEIsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbEQsQ0FBQzthQUFN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