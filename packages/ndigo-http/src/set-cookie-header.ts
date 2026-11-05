/**
 * Set-Cookie specific {@link HTTPHeader} category (Wave 5, 2026-09-27):
 * the write-side value formatter. The read side (`Cookie` parsing) lives
 * in `@ndigo/platform-node` (`parseCookies`); this module owns the
 * `Set-Cookie` value shape: `name=value` plus attributes, `; `-joined per
 * RFC 6265 §4.1.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTPHeader } from './http-header';

/**
 * Set-Cookie header category: value construction on the constant itself.
 *
 * ```ts
 * HTTPHeaders.SET_COOKIE.buildValue('ndigo-session', 'tok', ['HttpOnly', 'SameSite=Lax', 'Path=/']);
 * // 'ndigo-session=tok; HttpOnly; SameSite=Lax; Path=/'
 * ```
 */
export class SetCookieHeader extends HTTPHeader {
    /**
     * Builds a `Set-Cookie` value: `name=value` plus optional attributes,
     * `; `-joined. Attribute strings are inserted verbatim (e.g.
     * `'Max-Age=0'`, `'Expires=Thu, 01 Jan 1970 00:00:00 GMT'`).
     *
     * @param name - The cookie name.
     * @param value - The cookie value.
     * @param attributes - Optional cookie attributes (default none).
     */
    buildValue(name: string, value: string, attributes: readonly string[] = []): string {
        return [`${name}=${value}`, ...attributes].join('; ');
    }
}
