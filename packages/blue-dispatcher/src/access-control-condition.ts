/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';
import { AbstractRouteCondition, RouteCondition } from './route-condition';

/**
 * Structural check for a route that carries an authenticated principal.
 *
 * The `principal` property is added dynamically by authentication interceptors
 * and is not part of the base `Route` interface.
 */
interface HasPrincipal {
    principal: unknown;
}

const { defineProperty } = Reflect;

/**
 * The access level required for a route.
 */
export type AccessLevel = 'public' | 'private';

/**
 * A route condition that enforces access control (public vs. private routes).
 *
 * When a `RouteMappingInfo` carries an `AccessControlCondition`, the dispatcher
 * will only match the route if the incoming request meets the required access
 * level.  Private routes require an authenticated principal on the route;
 * public routes match regardless.
 *
 * This replaces the previous TODO comment in `route-mapping-info.ts`:
 * > TODO Create a condition for public vs. private routes
 */
export class AccessControlCondition
    extends AbstractRouteCondition<AccessControlCondition>
    implements RouteCondition<AccessControlCondition>
{
    /**
     * The access level required for this condition.
     */
    readonly access!: AccessLevel;

    get content(): string[] {
        return [this.access];
    }

    get infix(): string {
        return ' ';
    }

    /**
     * Create an access-control condition.
     *
     * @param access - The required access level (`'public'` or `'private'`).
     */
    constructor(access: AccessLevel) {
        super();
        defineProperty(this, 'access', {
            value: access,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    /**
     * Merge two access-control conditions.
     *
     * When merging class-level and method-level access conditions, the most
     * restrictive level wins (private beats public).
     *
     * @param other - The condition to merge with.
     * @returns The merged condition (most restrictive).
     */
    merge(other: AccessControlCondition): AccessControlCondition {
        if (this.access === 'private' || other.access === 'private') {
            return new AccessControlCondition('private');
        }
        return new AccessControlCondition('public');
    }

    /**
     * Determine whether this condition matches the given route.
     *
     * - Public routes always match.
     * - Private routes require that `route.principal` is set (i.e. the
     *   request has been authenticated).
     *
     * @param route - The current route.
     * @returns This condition when the route meets the access level, or `null`.
     */
    getMatchingCondition(route: Route): AccessControlCondition | null {
        if (this.access === 'public') {
            return this;
        }

        // Private route — require an authenticated principal.
        if (this.access === 'private' && (route as unknown as HasPrincipal).principal) {
            return this;
        }

        return null;
    }

    /**
     * Compare two access-control conditions by strictness.
     *
     * Private routes are considered "more specific" than public routes and
     * therefore sort first.
     *
     * @param value - The condition to compare against.
     * @param route - The route used to break ties, if needed (unused here).
     * @returns A negative number when `this` is more specific,
     *          a positive number when `value` is more specific,
     *          or zero when both have equal specificity.
     */
    compareTo(value: AccessControlCondition, route?: Route): number {
        if (this.access === value.access) {
            return 0;
        }
        // Private is more specific than public.
        return this.access === 'private' ? -1 : 1;
    }
}
