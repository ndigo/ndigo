/**
 * @author Jeff Rose
 */

import { ModelAndView } from './model-and-view';
import { PathRoute, Route } from '@blue/router';

export interface Controller {
    handleRoute(route: Route): ModelAndView;
}

/**
 */

/**
 * @param {module:router.Route} route
 * @returns {module:dispatcher.ModelAndView}
 */

export abstract class AbstractPathViewController implements Controller {
    get [Symbol.toStringTag](): string {
        return 'Controller';
    }

    handleRoute(route: Route): ModelAndView {
        const viewName = this._getViewNameForRoute(route);
        return new ModelAndView(viewName);
    }

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
export class PathViewController extends AbstractPathViewController {
    _viewNameCache: Map<string, string>;
    #prefix: string;
    #suffix: string;

    get prefix(): string {
        return this.#prefix;
    }

    set prefix(newPrefix: string) {
        this._viewNameCache.size && this._viewNameCache.clear();
        this.#prefix = newPrefix;
    }

    get suffix(): string {
        return this.#suffix;
    }

    set suffix(newSuffix: string) {
        this._viewNameCache.size && this._viewNameCache.clear();
        this.#suffix = newSuffix;
    }

    constructor() {
        super();

        this._viewNameCache = new Map<string, string>();
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
    protected _getViewNameForRoute(route: Route): string {
        return this._getViewNameForPath(route.path);
    }

    /**
     * @protected
         * @param {string} path
     * @returns {string}
     */
    protected _getViewNameForPath(path: string): string {
        let viewName = this._viewNameCache.get(path);

        if (!viewName) {
            const route = new PathRoute(path);

            viewName = `${this.prefix}${route.path}${this.suffix}`;
            this._viewNameCache.set(path, viewName);
        }

        return viewName;
    }
}
