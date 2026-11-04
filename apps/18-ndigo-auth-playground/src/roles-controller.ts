/**
 * Mode 3 (HTTP half) — role enforcement through `@authenticated` /
 * `@authorized`, resolved by {@link AuthMatrixGuard}.
 *
 * The two demo accounts are deliberately disjoint: `admin` holds `admin` only,
 * `alice` holds `user` only. So every row of the matrix is a real denial on one
 * account and a real success on the other, and `/auth/elevate` (mode 1) is what
 * moves a principal across rows.
 *
 * Denials come from the guard, not the handlers: `401` when no credential
 * verifies and `403` when it verifies but lacks the role. The handlers run only
 * after the guard has put the principal in the session bag, so they bind it with
 * `requestSessionValue('principal')` — the same seam
 * `NodeSessionInterceptor` fills for cookie requests.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { authenticated, authorized, type Principal } from '@ndigo/auth-core';
import { getMapping, parameters, requestMapping, requestSessionValue } from '@ndigo/dispatcher';
import { MODES, principalView } from './api-shape';
import { REQUEST_PRINCIPAL_KEY } from './http-pipeline';

/** The requirement labels the handlers echo back (also the README's matrix). */
export const HTTP_REQUIREMENTS = {
    authenticated: '@authenticated',
    admin: '@authenticated + @authorized(admin)',
    user: '@authenticated + @authorized(user)',
} as const;

/**
 * The role matrix over HTTP. Every route is metadata-guarded; none of them
 * inspects a credential itself.
 */
@requestMapping('/roles')
export class RolesController {
    /**
     * `GET /roles/authenticated` — any authenticated principal, whatever the
     * scheme (session cookie or Bearer access token).
     *
     * @param principal - The principal the guard resolved.
     * @returns The principal and the requirement it satisfied.
     */
    @getMapping('/authenticated')
    @authenticated
    @parameters({ principal: requestSessionValue(REQUEST_PRINCIPAL_KEY, { required: true }) })
    authenticatedOnly(principal: Principal) {
        return {
            mode: MODES.roles,
            surface: 'http',
            requirement: HTTP_REQUIREMENTS.authenticated,
            principal: principalView(principal),
        };
    }

    /**
     * `GET /roles/admin` — `admin` only. `alice` (a valid session, wrong role)
     * is denied `403`; no credential at all is denied `401`.
     *
     * @param principal - The principal the guard resolved and authorized.
     * @returns The principal and the requirement it satisfied.
     */
    @getMapping('/admin')
    @authenticated
    @authorized('admin')
    @parameters({ principal: requestSessionValue(REQUEST_PRINCIPAL_KEY, { required: true }) })
    adminOnly(principal: Principal) {
        return {
            mode: MODES.roles,
            surface: 'http',
            requirement: HTTP_REQUIREMENTS.admin,
            principal: principalView(principal),
        };
    }

    /**
     * `GET /roles/user` — `user` only. The mirror of the admin row: `admin` is
     * denied here, which is what makes the matrix a matrix rather than a
     * hierarchy.
     *
     * @param principal - The principal the guard resolved and authorized.
     * @returns The principal and the requirement it satisfied.
     */
    @getMapping('/user')
    @authenticated
    @authorized('user')
    @parameters({ principal: requestSessionValue(REQUEST_PRINCIPAL_KEY, { required: true }) })
    userOnly(principal: Principal) {
        return {
            mode: MODES.roles,
            surface: 'http',
            requirement: HTTP_REQUIREMENTS.user,
            principal: principalView(principal),
        };
    }
}
