/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';

/**
 * Browser session argument resolver using `sessionStorage`.
 */
export class BrowserSessionValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserSessionValueMethodArgumentResolver';
    }

    /** Retrieves a value from `sessionStorage` if available. */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        const storage = globalThis.sessionStorage;
        return storage ? storage.getItem(name) : null;
    }

    /** Returns whether this resolver supports session parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.SESSION.equals(parameter.type);
    }
}
