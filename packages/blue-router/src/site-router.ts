/**
 * @author Jeff Rose
 */

import { PathRoute } from './path-route';
import { Route } from './route';
import { AbstractRouter } from './router';
import { matchesPartitionPath, normalizePartitionPrefix, stripPartitionPrefix } from './route-partition';

export type FeatureRouteCallback = (route: Route) => void;

export interface FeatureRouteMount {
    callback: FeatureRouteCallback;
    prefix: string;
}

export class SiteRouter extends AbstractRouter {
    readonly callback = () => undefined;
    #mounts: FeatureRouteMount[];
    #route: string;

    get route(): string {
        return this.#route;
    }

    constructor() {
        super();
        this.#mounts = [];
        this.#route = '';
    }

    mount(prefix: string, callback: FeatureRouteCallback): this {
        this.#mounts.push({
            callback,
            prefix: normalizePartitionPrefix(prefix),
        });
        return this;
    }

    refresh(): void {
        if (this.#route) {
            this.navigate(this.#route);
        }
    }

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
