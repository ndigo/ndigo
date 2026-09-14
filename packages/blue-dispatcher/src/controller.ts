/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ModelAndView } from './model-and-view';
import { PathRoute, Route } from '@blue/router';

/**
 * Interface for a controller that handles routes.
 */
export interface Controller {
    /**
     * Handles the given route and returns a {@link ModelAndView}.
     * @param route - The route to handle.
     * @returns A {@link ModelAndView} for the route.
     */
    handleRoute(route: Route): ModelAndView;
}

/**
 * Abstract base class for controllers that resolve view names from the route path.
 */
export abstract class AbstractPathViewController implements Controller {
    /**
     * Returns the string tag for this controller.
     */
    get [Symbol.toStringTag](): string {
        return 'Controller';
    }

    /**
     * Handles the given route by resolving a view name from its path and returning a new {@link ModelAndView}.
     * @param route - The route to handle.
     * @returns A {@link ModelAndView} for the route.
     */
    handleRoute(route: Route): ModelAndView {
        const viewName = this._getViewNameForRoute(route);
        return new ModelAndView(viewName);
    }

    protected abstract _getViewNameForRoute(route: Route): string;
}

/**
 * Simple {@link Controller} implementation that transforms the path of a route into a view name.
 * Can optionally prepend a prefix and/or append a suffix to build the view name from the path.
 */
export class PathViewController extends AbstractPathViewController {
    /**
     * Cache for resolved view names.
     */
    _viewNameCache: Map<string, string>;
    #prefix!: string;
    #suffix!: string;

    /**
     * Gets the prefix to prepend to the view name.
     */
    get prefix(): string {
        return this.#prefix;
    }

    /**
     * Sets the prefix to prepend to the view name.
     * Clears the view name cache when set.
     */
    set prefix(newPrefix: string) {
        if (this._viewNameCache.size) {
            this._viewNameCache.clear();
        }
        this.#prefix = newPrefix;
    }

    /**
     * Gets the suffix to append to the view name.
     */
    get suffix(): string {
        return this.#suffix;
    }

    /**
     * Sets the suffix to append to the view name.
     * Clears the view name cache when set.
     */
    set suffix(newSuffix: string) {
        if (this._viewNameCache.size) {
            this._viewNameCache.clear();
        }
        this.#suffix = newSuffix;
    }

    /**
     * Creates an instance of PathViewController.
     */
    constructor() {
        super();

        this._viewNameCache = new Map<string, string>();
        this.prefix = '';
        this.suffix = '';
    }

    /**
     * Resolves the view name for the given route.
     * @param route - The route to resolve the view name for.
     * @returns The resolved view name.
     */
    protected _getViewNameForRoute(route: Route): string {
        return this._getViewNameForPath(route.path);
    }

    /**
     * Resolves the view name for the given path.
     * @param path - The path to resolve the view name for.
     * @returns The resolved view name.
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
