/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';
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

    /** Retrieves a raw cookie string from `document.cookie`. */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        const value = Cookies.get(name);
        return typeof value === 'string' ? value : undefined;
    }

    /** Returns whether this resolver supports cookie parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.COOKIE.equals(parameter.type);
    }
}
