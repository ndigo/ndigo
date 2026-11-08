/**
 * `@authenticated` / `@authorized` metadata decorators.
 */
import '@tsmetadata/polyfill';

export const AUTH_REQUIRED_KEY = 'auth:required';
export const AUTH_ROLES_KEY = 'auth:roles';

/**
 * Marks a class or method as requiring authentication.
 *
 * This is a passive metadata decorator. The actual enforcement is handled
 * by the `AuthRouteGuard` (server-side) or `ClientAuthGuard` (client-side).
 *
 * @param target - The decorated class or method.
 * @param context - The decorator context.
 * @returns Nothing; metadata is recorded on the context.
 */
export function authenticated(target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
    const kind = context.kind;
    if (kind !== 'class' && kind !== 'method') {
        throw new TypeError(`@authenticated can only be applied to a class or method — received '${kind}'.`);
    }
    if (kind === 'class') {
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
 * @returns The class/method decorator.
 *
 * @example
 * ```ts
 * class AdminController {
 *     @authorized('admin')
 *     deleteAll(): void {}
 * }
 * ```
 */
export function authorized(role: string) {
    return function (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void {
        const kind = context.kind;
        if (kind !== 'class' && kind !== 'method') {
            throw new TypeError(`@authorized can only be applied to a class or method — received '${kind}'.`);
        }
        const key = kind === 'class' ? AUTH_ROLES_KEY : `${AUTH_ROLES_KEY}:${String(context.name)}`;
        const existing = (context.metadata[key] as string[] | undefined) ?? [];
        context.metadata[key] = [...existing, role];
    };
}
