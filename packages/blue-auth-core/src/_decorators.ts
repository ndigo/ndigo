import '@tsmetadata/polyfill';

export const AUTH_REQUIRED_KEY = 'auth:required';
export const AUTH_ROLES_KEY = 'auth:roles';

/**
 * Marks a class or method as requiring authentication.
 *
 * This is a passive metadata decorator. The actual enforcement is handled
 * by the `AuthRouteGuard` (server-side) or `ClientAuthGuard` (client-side).
 */
export function authenticated(target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
    if (context.kind === 'class') {
        context.metadata[AUTH_REQUIRED_KEY] = true;
    } else {
        context.metadata[`${AUTH_REQUIRED_KEY}:${String(context.name)}`] = true;
    }
}

/**
 * Marks a class or method as requiring a specific role.
 *
 * Multiple `@authorized` decorators may be stacked — all declared roles must
 * be present on the principal for access to be granted.
 *
 * This is a passive metadata decorator.
 *
 * @param role - The role name that the principal must possess.
 */
export function authorized(role: string) {
    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        const key = context.kind === 'class' ? AUTH_ROLES_KEY : `${AUTH_ROLES_KEY}:${String(context.name)}`;
        const existing = (context.metadata[key] as string[] | undefined) ?? [];
        context.metadata[key] = [...existing, role];
    };
}
