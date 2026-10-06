/**
 * @module blue-router
 * @since 1.0.0
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
 * A concrete router implementation that extends `AbstractRouter` to manage
 * and navigate through partitioned routes.
 * It supports mounting feature-specific routes at defined prefixes.
 * @since 1.0.0
 */
export class PartitionRouter extends AbstractRouter {
    readonly callback = () => undefined;
    #mounts: FeatureRouteMount[];
    #route: string;

    /**
     * Gets the current full route path managed by the `PartitionRouter`.
     * @returns The current route path as a string.
     * @since 1.0.0
     */
    get route(): string {
        return this.#route;
    }

    /**
     * Creates an instance of `PartitionRouter`.
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
     *
     * Prefixes are unique per router: navigation dispatches to the first
     * matching mount and `unmount` removes by prefix, so a second mount at an
     * existing prefix would be unreachable and could unmount its sibling.
     *
     * @param prefix - The URL prefix at which to mount the feature route.
     * @param callback - The `FeatureRouteCallback` to execute when the prefix matches.
     * @returns The current `PartitionRouter` instance for chaining.
     * @throws {TypeError} When a mount already exists at the normalized prefix.
     * @since 1.0.0
     */
    mount(prefix: string, callback: FeatureRouteCallback): this {
        const normalized = normalizePartitionPrefix(prefix);
        if (this.#mounts.some((mount) => mount.prefix === normalized)) {
            throw new TypeError(`A feature is already mounted at prefix '${normalized}'`);
        }
        this.#mounts.push({
            callback,
            prefix: normalized,
        });
        return this;
    }

    /**
     * Removes a mounted feature route at the specified URL prefix.
     *
     * @param prefix - The URL prefix to unmount.
     * @returns `true` if a mount was removed, `false` if none matched.
     * @since 1.0.0
     */
    unmount(prefix: string): boolean {
        const normalized = normalizePartitionPrefix(prefix);
        const before = this.#mounts.length;
        this.#mounts = this.#mounts.filter((mount) => mount.prefix !== normalized);
        return this.#mounts.length !== before;
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
