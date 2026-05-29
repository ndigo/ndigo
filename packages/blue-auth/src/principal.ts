/**
 * @author Jeff Rose
 */

/**
 * Represents an authenticated user or entity in the system.
 */
export interface Principal {
    /** Unique identifier for this principal. */
    readonly id: string;

    /** Human-readable display name. */
    readonly name: string;

    /** Roles assigned to this principal. */
    readonly roles: ReadonlyArray<string>;

    /**
     * Returns `true` if this principal has the given role.
     *
     * @param role - The role name to test.
     */
    hasRole(role: string): boolean;

    /**
     * Returns `true` if this principal has **at least one** of the given roles.
     *
     * @param roles - One or more role names to test.
     */
    hasAnyRole(...roles: string[]): boolean;
}

/**
 * Sentinel principal representing an unauthenticated user.
 *
 * `hasRole` and `hasAnyRole` always return `false`.
 */
export class AnonymousPrincipal implements Principal {
    readonly id = 'anonymous';
    readonly name = 'Anonymous';
    readonly roles: ReadonlyArray<string> = [];

    hasRole(_role: string): boolean {
        return false;
    }

    hasAnyRole(..._roles: string[]): boolean {
        return false;
    }
}

/**
 * Duck-type guard — returns `true` when `value` looks like a {@link Principal}.
 *
 * @param value - The value to inspect.
 */
export function isPrincipal(value: unknown): value is Principal {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'roles' in value
    );
}
