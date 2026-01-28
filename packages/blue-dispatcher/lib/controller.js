/**
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { PathRoute } from '@blue/router';
/**
 */
/**
 * @param {module:router.Route} route
 * @returns {module:dispatcher.ModelAndView}
 */
export class AbstractPathViewController {
    get [Symbol.toStringTag]() {
        return 'Controller';
    }
    handleRoute(route) {
        const viewName = this._getViewNameForRoute(route);
        return new ModelAndView(viewName);
    }
}
/**
 * ! Changing PathViewController._viewNameCache to PathViewController.#viewNameCache breaks unit tests. -JBR
 */
/**
 * @abstract
 * @implements module:dispatcher.Controller
 */
/**
 * @param {module:router.Route} route
 * @returns {module:dispatcher.ModelAndView}
 */
/**
 * @abstract
 * @protected
 * @param {module:router.Route} route
 * @returns {string}
 */
/**
 * Simple {@link Controller|Controller} implementation that transforms the path of a route into a view name.
 * Can optionaly prepend a prefix and/or append a suffix a build the view name from the path.
 * @extends module:dispatcher.AbstractPathViewController
 */
export class PathViewController extends AbstractPathViewController {
    _viewNameCache;
    #prefix;
    #suffix;
    get prefix() {
        return this.#prefix;
    }
    set prefix(newPrefix) {
        this._viewNameCache.size && this._viewNameCache.clear();
        this.#prefix = newPrefix;
    }
    get suffix() {
        return this.#suffix;
    }
    set suffix(newSuffix) {
        this._viewNameCache.size && this._viewNameCache.clear();
        this.#suffix = newSuffix;
    }
    constructor() {
        super();
        this._viewNameCache = new Map();
        /**
         */
        this.prefix = '';
        /**
         */
        this.suffix = '';
    }
    /**
     * @protected
     * @param {module:router.Route} route
     * @returns {string}
     */
    _getViewNameForRoute(route) {
        return this._getViewNameForPath(route.path);
    }
    /**
     * @protected
     * @param {string} path
     * @returns {string}
     */
    _getViewNameForPath(path) {
        let viewName = this._viewNameCache.get(path);
        if (!viewName) {
            const route = new PathRoute(path);
            viewName = `${this.prefix}${route.path}${this.suffix}`;
            this._viewNameCache.set(path, viewName);
        }
        return viewName;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQVMsTUFBTSxjQUFjLENBQUM7QUFNaEQ7R0FDRztBQUVIOzs7R0FHRztBQUVILE1BQU0sT0FBZ0IsMEJBQTBCO0lBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sWUFBWSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxXQUFXLENBQUMsS0FBWTtRQUNwQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEQsT0FBTyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QyxDQUFDO0NBR0o7QUFFRDs7R0FFRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxrQkFBbUIsU0FBUSwwQkFBMEI7SUFDOUQsY0FBYyxDQUFzQjtJQUNwQyxPQUFPLENBQVM7SUFDaEIsT0FBTyxDQUFTO0lBRWhCLElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxNQUFNLENBQUMsU0FBaUI7UUFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxTQUFpQjtRQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUNoRDtXQUNHO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakI7V0FDRztRQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7OztPQUlHO0lBQ08sb0JBQW9CLENBQUMsS0FBWTtRQUN2QyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxtQkFBbUIsQ0FBQyxJQUFZO1FBQ3RDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNaLE1BQU0sS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxDLFFBQVEsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDdkQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0oifQ==