/**
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { PathRoute } from '@blue/router';
/**
 * @interface module:dispatcher.Controller
 */
/**
 * @function module:dispatcher.Controller#handleRoute
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
 * @class module:dispatcher.AbstractPathViewController
 * @implements module:dispatcher.Controller
 */
/**
 * @function module:dispatcher.AbstractPathViewController#handleRoute
 * @param {module:router.Route} route
 * @returns {module:dispatcher.ModelAndView}
 */
/**
 * @abstract
 * @protected
 * @function module:dispatcher.AbstractPathViewController#_getViewNameForRoute
 * @param {module:router.Route} route
 * @returns {external:string}
 */
/**
 * Simple {@linkcode module:dispatcher.Controller|Controller} implementation that transforms the path of a route into a view name.
 * Can optionaly prepend a prefix and/or append a suffix a build the view name from the path.
 * @class module:dispatcher.PathViewController
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
         * @member {external:string} module:dispatcher.PathViewController#prefix=''
         */
        this.prefix = '';
        /**
         * @member {external:string} module:dispatcher.PathViewController#suffix=''
         */
        this.suffix = '';
    }
    /**
     * @protected
     * @function module:dispatcher.PathViewController#_getViewNameForRoute
     * @param {module:router.Route} route
     * @returns {external:string}
     */
    _getViewNameForRoute(route) {
        return this._getViewNameForPath(route.path);
    }
    /**
     * @protected
     * @function module:dispatcher.PathViewController#_getViewNameForPath
     * @param {external:string} path
     * @returns {external:string}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxTQUFTLEVBQVMsTUFBTSxjQUFjLENBQUM7QUFNaEQ7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUgsTUFBTSxPQUFnQiwwQkFBMEI7SUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxZQUFZLENBQUM7SUFDeEIsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFZO1FBQ3BCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRCxPQUFPLElBQUksWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RDLENBQUM7Q0FHSjtBQUVEOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxrQkFBbUIsU0FBUSwwQkFBMEI7SUFDOUQsY0FBYyxDQUFzQjtJQUNwQyxPQUFPLENBQVM7SUFDaEIsT0FBTyxDQUFTO0lBRWhCLElBQUksTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxNQUFNLENBQUMsU0FBaUI7UUFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztJQUM3QixDQUFDO0lBRUQsSUFBSSxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLE1BQU0sQ0FBQyxTQUFpQjtRQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hELElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO0lBQzdCLENBQUM7SUFFRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBRVIsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUNoRDs7V0FFRztRQUNILElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCOztXQUVHO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ08sb0JBQW9CLENBQUMsS0FBWTtRQUN2QyxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ08sbUJBQW1CLENBQUMsSUFBWTtRQUN0QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDWixNQUFNLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVsQyxRQUFRLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztDQUNKIn0=