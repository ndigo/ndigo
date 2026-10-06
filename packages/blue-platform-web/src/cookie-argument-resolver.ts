/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractCookieValueArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import Cookies from './cookies';

/**
 * Browser cookie argument resolver using `document.cookie` parsing.
 *
 * Binds `cookieValue()` (no name → the whole parsed jar) and named cookie
 * values through the shared `AbstractCookieValueArgumentResolver` base.
 */
export class BrowserCookieValueMethodArgumentResolver extends AbstractCookieValueArgumentResolver {
    get [Symbol.toStringTag](): string {
        return 'BrowserCookieValueMethodArgumentResolver';
    }

    /** Parses the whole `document.cookie` jar; absent storage yields no jar. */
    protected getCookieJar(_route: Route): Record<string, unknown> | undefined {
        const jar: unknown = Cookies.get('');
        return typeof jar === 'object' && jar !== null ? (jar as Record<string, unknown>) : undefined;
    }
}
