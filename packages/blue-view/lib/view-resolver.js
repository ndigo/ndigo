/**
 * @author Jeff Rose
 */
import { createNull, MediaTypes, Null } from '@blue/core';
import { likeInitializable } from '@blue/factory';
import { AsApplicationContextAware, likeApplicationContextAware } from '@blue/context';
/**
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
    async _loadView(name, language) {
        const path = `${this.prefix}${name}${this.suffix}`, ViewClass = await import(/* webpackIgnore: true */ path).then((module) => module.default);
        console.log('View', name, ViewClass);
        return new ViewClass();
    }
}
/**
 * A simple implementation of {@link ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.
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
 * A {@link ViewResolver|`ViewResolver`} that delegates to others.
 * @implements module:core.Initializable
 * @implements module:core.ViewResolver
 * @see module:context.AsApplicationContextAware
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1yZXNvbHZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92aWV3LXJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLFVBQVUsRUFBYSxVQUFVLEVBQUUsSUFBSSxFQUFpQixNQUFNLFlBQVksQ0FBQztBQUNwRixPQUFPLEVBQWlCLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2pFLE9BQU8sRUFBc0IseUJBQXlCLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFXM0c7O0dBRUc7QUFDSCxNQUFNLGNBQWM7SUFDUCxTQUFTLEdBQWMsSUFBSSxDQUFDO0lBRXJDLE1BQU0sQ0FBQyxLQUFVLEVBQUUsT0FBWTtRQUMzQixPQUFPO0lBQ1gsQ0FBQztDQUNKO0FBRUQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsRUFDekMsY0FBYyxHQUFTLElBQUksY0FBYyxFQUFFLENBQUM7QUFFaEQsTUFBTSxPQUFnQiwyQkFBMkI7SUFDcEMsS0FBSyxDQUEwQjtJQUN4QyxTQUFTLENBQVU7SUFFbkI7UUFDSSxjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQixLQUFLLEVBQUUsVUFBVSxFQUFFO1lBQ25CLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLElBQVksRUFBRSxRQUFjO1FBQzlDLElBQUksSUFBVSxDQUFDO1FBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNsQixJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNsRCxDQUFDO2FBQU0s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