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

    /** OAuth scopes granted to this principal. */
    readonly scopes: ReadonlyArray<string>;

    /**
     * Returns `true` if this principal has the given role.
     *
     * @param role - The role name to test.
     * @returns Whether the role is assigned.
     */
    hasRole(role: string): boolean;

    /**
     * Returns `true` if this principal has **at least one** of the given roles.
     *
     * @param roles - The role names to test.
     * @returns Whether any role is assigned.
     */
    hasAnyRole(...roles: string[]): boolean;

    /**
     * Returns `true` if this principal has the given scope.
     *
     * @param scope - The scope name to test.
     * @returns Whether the scope is granted.
     */
    hasScope(scope: string): boolean;

    /**
     * Returns `true` if this principal has **at least one** of the given scopes.
     *
     * @param scopes - The scope names to test.
     * @returns Whether any scope is granted.
     */
    hasAnyScope(...scopes: string[]): boolean;
}

/**
 * Sentinel principal representing an unauthenticated user.
 */
export class AnonymousPrincipal implements Principal {
    /** The sentinel id (`'anonymous'`). */
    readonly id = 'anonymous';
    /** The display name (`'Anonymous'`). */
    readonly name = 'Anonymous';
    /** The empty role set. */
    readonly roles: ReadonlyArray<string> = [];
    /** The empty scope set. */
    readonly scopes: ReadonlyArray<string> = [];

    /**
     * Always `false` for the anonymous sentinel.
     *
     * @param _role - Ignored.
     * @returns Always `false`.
     */
    hasRole(_role: string): boolean {
        return false;
    }

    /**
     * Always `false` for the anonymous sentinel.
     *
     * @param _roles - Ignored.
     * @returns Always `false`.
     */
    hasAnyRole(..._roles: string[]): boolean {
        return false;
    }

    /**
     * Always `false` for the anonymous sentinel.
     *
     * @param _scope - Ignored.
     * @returns Always `false`.
     */
    hasScope(_scope: string): boolean {
        return false;
    }

    /**
     * Always `false` for the anonymous sentinel.
     *
     * @param _scopes - Ignored.
     * @returns Always `false`.
     */
    hasAnyScope(..._scopes: string[]): boolean {
        return false;
    }
}

/**
 * The framework's concrete principal, used by authentication adapters to
 * materialize identities from user records (e.g.
 * `CredentialsAuthAdapter` — AD-33 D-5).
 */
export class DefaultPrincipal implements Principal {
    /** Unique identifier for this principal. */
    readonly id: string;
    /** Human-readable display name. */
    readonly name: string;
    /** Roles assigned to this principal. */
    readonly roles: ReadonlyArray<string>;
    /** OAuth scopes granted to this principal. */
    readonly scopes: ReadonlyArray<string>;

    constructor(id: string, name: string, roles: readonly string[] = [], scopes: readonly string[] = []) {
        this.id = id;
        this.name = name;
        this.roles = roles;
        this.scopes = scopes;
    }

    /**
     * Returns `true` if this principal has the given role.
     *
     * @param role - The role name to test.
     * @returns Whether the role is assigned.
     */
    hasRole(role: string): boolean {
        return this.roles.includes(role);
    }

    /**
     * Returns `true` if this principal has at least one of the given roles.
     *
     * @param roles - The role names to test.
     * @returns Whether any role is assigned.
     */
    hasAnyRole(...roles: string[]): boolean {
        return roles.some((role) => this.roles.includes(role));
    }

    /**
     * Returns `true` if this principal has the given scope.
     *
     * @param scope - The scope name to test.
     * @returns Whether the scope is granted.
     */
    hasScope(scope: string): boolean {
        return this.scopes.includes(scope);
    }

    /**
     * Returns `true` if this principal has at least one of the given scopes.
     *
     * @param scopes - The scope names to test.
     * @returns Whether any scope is granted.
     */
    hasAnyScope(...scopes: string[]): boolean {
        return scopes.some((scope) => this.scopes.includes(scope));
    }
}

/**
 * Duck-type guard for {@link Principal}: shape check, not identity —
 * per STYLE_GUIDE §3.7, property/method-presence guards use the `like*`
 * prefix (`is*` is reserved for `instanceof`/`typeof` checks).
 *
 * @param value - The candidate value to inspect.
 * @returns `true` when the value has the principal shape.
 */
export function likePrincipal(value: unknown): value is Principal {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'name' in value &&
        'roles' in value &&
        'scopes' in value
    );
}
