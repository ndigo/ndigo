/**
 * @author Jeff Rose
 */
import { Null, PathMatcher } from '@blue/core';
import { ApplicationContext } from '@blue/context';
import { Route } from '@blue/router';
export interface ViewMapping {
    getTarget(route: Route): any;
}
declare const AbstractViewMapping_base: (new (...args: any[]) => import("@blue/factory").NameAware) & import("@blue/core").Constructable<import("@blue/context").ApplicationContextAware> & typeof Null;
export declare abstract class AbstractViewMapping extends AbstractViewMapping_base implements ViewMapping {
    applicationContext: ApplicationContext;
    defaultTarget: any;
    interceptors: any[];
    pathMatcher: PathMatcher;
    get [Symbol.toStringTag](): string;
    constructor();
    getTarget(route: Route): any;
    protected abstract _getTarget(route: Route): any;
}
export declare abstract class AbstractPathViewMapping extends AbstractViewMapping {
    rootTarget: any;
    useTrailingSlashMatch: boolean;
    protected readonly _targets: Map<string, any>;
    constructor();
}
export {};
//# sourceMappingURL=view-mapping.d.ts.map