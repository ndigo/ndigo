/**
 * @author Jeff Rose
 */

import { Null, PathMatcher, GlobPathMatcher } from '@blue/core';
import { AsNameAware } from '@blue/factory';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Route } from '@blue/router';

export interface ViewMapping {
    getTarget(route: Route): any;
}

/**
 * @interface module:view.ViewMapping
 */

/**
 * @function module:view.ViewMapping#getTarget
 * @param {module:router.Route} route
 */

const { defineProperty } = Reflect;

export abstract class AbstractViewMapping extends AsNameAware(AsApplicationContextAware(Null)) implements ViewMapping {
    applicationContext: ApplicationContext;
    defaultTarget: any;
    interceptors: any[];
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

    getTarget(route: Route): any {
        let target = this._getTarget(route);

        if (!target) {
            target = this.defaultTarget;
        }
        if (!target) {
            return null;
        }
    }

    protected abstract _getTarget(route: Route): any;
}

export abstract class AbstractPathViewMapping extends AbstractViewMapping {
    rootTarget;
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
