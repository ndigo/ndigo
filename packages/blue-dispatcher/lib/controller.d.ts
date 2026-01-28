/**
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { Route } from '@blue/router';
export interface Controller {
    handleRoute(route: Route): ModelAndView;
}
/**
 */
/**
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
     * @param {module:router.Route} route
     * @returns {string}
     */
    protected _getViewNameForRoute(route: Route): string;
    /**
     * @protected
     * @param {string} path
     * @returns {string}
     */
    protected _getViewNameForPath(path: string): string;
}
//# sourceMappingURL=controller.d.ts.map