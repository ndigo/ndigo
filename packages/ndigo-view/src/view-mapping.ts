/**
 * View mappings that resolve a route to a view.
 */
import { Null, PathMatcher, URLGlobPathMatcher } from '@ndigo/core';
import { AsNameAware } from '@ndigo/factory';
import { ApplicationContext, AsApplicationContextAware } from '@ndigo/context';
import { Route } from '@ndigo/router';

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
    getTarget(route: Route): unknown;
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
    applicationContext!: ApplicationContext;
    /**
     * The fallback target returned when no route-specific target is found.
     */
    defaultTarget: unknown;
    /**
     * The interceptors applied while resolving targets.
     */
    interceptors!: unknown[];
    /**
     * The path matcher used to match request paths to targets.
     */
    pathMatcher!: PathMatcher;

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
            value: new URLGlobPathMatcher(),
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
    getTarget(route: Route): unknown {
        let target = this._getTarget(route);

        if (!target) {
            target = this.defaultTarget;
        }
        if (!target) {
            return null;
        }

        return target;
    }

    /**
     * Resolves the target for a route.
     *
     * @param route - The route to resolve.
     * @returns The mapped target, or `null` when the route does not match.
     */
    protected abstract _getTarget(route: Route): unknown;
}

/**
 * Base implementation for mappings that resolve targets by path.
 */
export abstract class AbstractPathViewMapping extends AbstractViewMapping {
    /**
     * The target returned for the root path when one is configured.
     */
    rootTarget: unknown;
    /**
     * Indicates whether trailing slashes should be treated as equivalent.
     */
    useTrailingSlashMatch: boolean;

    /** The path-to-target map for this mapping. */
    protected readonly _targets!: Map<string, unknown>;

    constructor() {
        super();
        this.rootTarget = null;
        this.useTrailingSlashMatch = false;

        defineProperty(this, '_targets', {
            value: new Map<string, unknown>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
