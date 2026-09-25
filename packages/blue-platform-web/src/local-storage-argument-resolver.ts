/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';

/**
 * Browser local-storage argument resolver using `localStorage`.
 */
export class BrowserLocalStorageValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserLocalStorageValueMethodArgumentResolver';
    }

    /** Retrieves a value from `localStorage`, or the whole jar when no name is given (scalar-only, D-2). */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        const storage = globalThis.localStorage;
        if (!storage) {
            return null;
        }
        // `localStorageValue()` (no name) binds the whole storage jar.
        if (name === '') {
            const jar: Record<string, unknown> = {};
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key) {
                    jar[key] = storage.getItem(key);
                }
            }
            return jar;
        }
        return storage.getItem(name);
    }

    /** Returns whether this resolver supports local-storage parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.LOCAL_STORAGE.equals(parameter.type);
    }
}
