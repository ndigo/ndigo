/**
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
export interface Controller {
    handleRoute(route: Route): ModelAndView;
}
/**
 * @interface module:dispatcher.Controller
 */
/**
 * @function module:dispatcher.Controller#handleRoute
 * @param {module:router.Route} route
 * @returns {module:dispatcher.ModelAndView}
 */
export declare abstract class AbstractPathViewController implements Controller {
    get [Symbol.toStringTag](): string;
    handleRoute(route: Route): ModelAndView;
    protected abstract _getViewNameForRoute(route: Route): string;
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
export declare class PathViewController extends AbstractPathViewController {
    #private;
    _viewNameCache: Map<string, string>;
    get prefix(): string;
    set prefix(newPrefix: string);
    get suffix(): string;
    set suffix(newSuffix: string);
    constructor();
    /**
     * @protected
     * @function module:dispatcher.PathViewController#_getViewNameForRoute
     * @param {module:router.Route} route
     * @returns {external:string}
     */
    protected _getViewNameForRoute(route: Route): string;
    /**
     * @protected
     * @function module:dispatcher.PathViewController#_getViewNameForPath
     * @param {external:string} path
     * @returns {external:string}
     */
    protected _getViewNameForPath(path: string): string;
}
//# sourceMappingURL=controller.d.ts.map