/**
 * Authorization specific {@link HTTPHeader} category (Wave 5, 2026-09-27):
 * credential-scheme extraction. Apps gate handlers by reading the
 * `Authorization` value (via `headerValue('authorization')` or a record)
 * and stripping the scheme; the constant owns that parsing once.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTPHeader } from './http-header';

/**
 * Authorization header category: credential-scheme parsing on the constant
 * itself.
 *
 * ```ts
 * HTTPHeaders.AUTHORIZATION.bearerToken('Bearer abc.def') // 'abc.def'
 * HTTPHeaders.AUTHORIZATION.bearerToken(null)            // undefined
 * ```
 */
export class AuthorizationHeader extends HTTPHeader {
    /**
     * Extracts the `Bearer`-scheme credential from an `Authorization`
     * value (scheme case-insensitive, surrounding whitespace tolerated).
     * `undefined` when the value is absent (`undefined`/`null` — header
     * resolvers bind `null` for a missing header), not bearer-shaped, or
     * carries no token; callers treat `undefined` as unauthenticated.
     *
     * @param authorization - The raw `Authorization` header value.
     */
    bearerToken(authorization: string | null | undefined): string | undefined {
        if (typeof authorization !== 'string') {
            return undefined;
        }
        const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
        return match === null ? undefined : match[1];
    }
}
