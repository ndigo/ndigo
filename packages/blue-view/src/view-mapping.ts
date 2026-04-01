/**
 * @author Jeff Rose
 */

import { Null, PathMatcher, GlobPathMatcher } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Route } from '@blue/router';

/**
 * Resolves a route to the view target that should handle it.
 */
export interface ViewMapping {
    /**
     * Returns the target associated with the given route.
     *
     * @param route - The route being resolved.
     * @returns The resolved target, or `null` when no target matches.
     */
    getTarget(route: Route): any;
}

const { defineProperty } = Reflect;

/**
 * Base implementation for route-to-target mappings.
 *
 * Subclasses are responsible for the route matching strategy; this class only
 * handles default-target fallback and shared mapping state.
 */
export abstract class AbstractViewMapping extends AsNameAware(AsApplicationContextAware(Null)) implements ViewMapping {
    /**
     * The application context used to look up mapping dependencies.
     */
    applicationContext: ApplicationContext;
    /**
     * The fallback target returned when no route-specific target is found.
     */
    defaultTarget: any;
    /**
     * The interceptors applied while resolving targets.
     */
    interceptors: any[];
    /**
     * The matcher used to compare route paths.
     */
    pathMatcher: PathMatcher;

    get [Symbol.toStringTag](): string {
        return 'ViewMapping';
    }

    constructor() {
        super();
        defineProperty(this, 'defaultTarget', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'interceptors', {
            value: [],
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'pathMatcher', {
            value: new GlobPathMatcher(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Returns the target associated with the given route.
     *
     * @param route - The route being resolved.
     * @returns The resolved target, or `null` when no target matches.
     */
    getTarget(route: Route): any {
        let target = this._getTarget(route);

        if (!target) {
            target = this.defaultTarget;
        }
        if (!target) {
            return null;
        }

        return target;
    }

    protected abstract _getTarget(route: Route): any;
}

/**
 * Base implementation for mappings that resolve targets by path.
 */
export abstract class AbstractPathViewMapping extends AbstractViewMapping {
    /**
     * The target returned for the root path when one is configured.
     */
    rootTarget;
    /**
     * Indicates whether trailing slashes should be treated as equivalent.
     */
    useTrailingSlashMatch: boolean;

    protected readonly _targets: Map<string, any>;

    constructor() {
        super();
        this.rootTarget = null;
        this.useTrailingSlashMatch = false;

        defineProperty(this, '_targets', {
            value: new Map<string, string | any>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
