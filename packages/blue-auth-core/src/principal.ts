/**
 * Represents an authenticated user or entity in the system.
 * This interface is immutable to ensure identity stability.
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
     */
    hasRole(role: string): boolean;

    /**
     * Returns `true` if this principal has **at least one** of the given roles.
     */
    hasAnyRole(...roles: string[]): boolean;
}

/**
 * Sentinel principal representing an unauthenticated user.
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
 * Duck-type guard for {@link Principal}: shape check, not identity —
 * per STYLE_GUIDE §3.7, property/method-presence guards use the `like*`
 * prefix (`is*` is reserved for `instanceof`/`typeof` checks).
 */
export function likePrincipal(value: unknown): value is Principal {
    return typeof value === 'object' && value !== null && 'id' in value && 'name' in value && 'roles' in value;
}
