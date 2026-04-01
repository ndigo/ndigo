/**
 * @author Jeff Rose
 */

import { PathRoute } from './path-route';
import { Route } from './route';
import { AbstractRouter } from './router';
import { matchesPartitionPath, normalizePartitionPrefix, stripPartitionPrefix } from './route-partition';

/**
 * A callback function type that is invoked when a feature route is matched.
 * @param route - The `Route` object representing the matched feature route.
 * @since 1.0.0
 */
export type FeatureRouteCallback = (route: Route) => void;

/**
 * Represents a mounted feature route, associating a callback with a URL prefix.
 * @since 1.0.0
 */
export interface FeatureRouteMount {
    callback: FeatureRouteCallback;
    prefix: string;
}

/**
 * A concrete router implementation that extends `AbstractRouter` to manage and navigate through site-wide routes.
 * It supports mounting feature-specific routes at defined prefixes.
 * @since 1.0.0
 */
export class SiteRouter extends AbstractRouter {
    readonly callback = () => undefined;
    #mounts: FeatureRouteMount[];
    #route: string;

    /**
     * Gets the current full route path managed by the `SiteRouter`.
     * @returns The current route path as a string.
     * @since 1.0.0
     */
    get route(): string {
        return this.#route;
    }

    /**
     * Creates an instance of `SiteRouter`.
     * @since 1.0.0
     */
    constructor() {
        super();
        this.#mounts = [];
        this.#route = '';
    }

    /**
     * Mounts a feature route at a specified URL prefix.
     * When a route matching the prefix is navigated, the provided callback will be invoked with the stripped route.
     * @param prefix - The URL prefix at which to mount the feature route.
     * @param callback - The `FeatureRouteCallback` to execute when the prefix matches.
     * @returns The current `SiteRouter` instance for chaining.
     * @since 1.0.0
     */
    mount(prefix: string, callback: FeatureRouteCallback): this {
        this.#mounts.push({
            callback,
            prefix: normalizePartitionPrefix(prefix),
        });
        return this;
    }

    /**
     * Refreshes the current route by re-navigating to the last known route.
     * This can be used to re-evaluate all mounted routes and their callbacks.
     * @since 1.0.0
     */
    refresh(): void {
        if (this.#route) {
            this.navigate(this.#route);
        }
    }

    /**
     * Navigates the router to the specified path.
     * It attempts to match the path against all mounted feature routes and invokes the corresponding callback.
     * @param path - The path to navigate to.
     * @returns `true` if a mounted route handled the navigation, `false` otherwise.
     * @since 1.0.0
     */
    navigate(path: string): boolean {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        this.#route = normalizedPath;

        for (const mount of this.#mounts) {
            if (!matchesPartitionPath(normalizedPath, mount.prefix)) {
                continue;
            }

            mount.callback(new PathRoute(stripPartitionPrefix(normalizedPath, mount.prefix)));
            return true;
        }

        return false;
    }
}
