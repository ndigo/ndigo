/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    convertArgumentValue,
} from '@blue/dispatcher';
import { Route } from '@blue/router';
import Cookies from './cookies';

/**
 * Browser cookie argument resolver using `document.cookie` parsing.
 */
export class BrowserCookieValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserCookieValueMethodArgumentResolver';
    }

    /** Retrieves a cookie value from `document.cookie`, or the whole jar when no name is given. */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        // `cookieValue()` (no name) binds the whole cookie jar.
        if (name === '') {
            const jar: unknown = Cookies.get('');
            return typeof jar === 'object' && jar !== null ? jar : undefined;
        }
        const value = Cookies.get(name);
        return typeof value === 'string' ? value : undefined;
    }

    /** Returns whether this resolver supports cookie parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.COOKIE.equals(parameter.type);
    }
}
