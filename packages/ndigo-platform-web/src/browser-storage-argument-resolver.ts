/**
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    convertArgumentValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';

/**
 * Dumps every key/value pair of a browser storage object into a plain record.
 *
 * Shared by the storage value resolvers and the whole-source data-binding
 * resolver so the jar-dump loop lives in exactly one place (DSG-3).
 *
 * @param storage - The browser storage (`sessionStorage`/`localStorage`), or
 *   `null`/`undefined` when unavailable (e.g. prerendering, tests without a
 *   browser environment). Absent storage yields an empty record.
 * @returns The storage contents keyed by storage key.
 */
export function dumpStorage(storage: Storage | null | undefined): Record<string, unknown> {
    const jar: Record<string, unknown> = {};

    if (storage) {
        const storageLength = storage.length;
        for (let i = 0; i < storageLength; i++) {
            const key = storage.key(i);

            if (key) {
                jar[key] = storage.getItem(key);
            }
        }
    }

    return jar;
}

/**
 * Browser storage argument resolver for `sessionStorage` and `localStorage`.
 *
 * One parameterized resolver replaces the former per-storage classes: the
 * constructor takes the storage accessor, the `MethodParameterType` to match,
 * and the `Symbol.toStringTag` label, so the session/local registrations stay
 * distinguishable (D-2).
 */
export class BrowserStorageValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    readonly #storage: () => Storage | null;
    readonly #type: MethodParameterType;
    readonly #tag: string;

    /**
     * Creates a browser storage argument resolver.
     *
     * @param storage - Accessor returning the browser storage to read
     *   (`() => globalThis.sessionStorage` or `() => globalThis.localStorage`).
     * @param type - The parameter type this resolver supports.
     * @param tag - The `Symbol.toStringTag` label for this registration.
     */
    constructor(storage: () => Storage | null, type: MethodParameterType, tag: string) {
        super(convertArgumentValue);
        this.#storage = storage;
        this.#type = type;
        this.#tag = tag;
    }

    get [Symbol.toStringTag](): string {
        return this.#tag;
    }

    /** Retrieves a value from the storage, or the whole jar when no name is given (scalar-only, D-2). */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        const storage = this.#storage();

        if (!storage) {
            return null;
        }

        // `sessionStorageValue()`/`localStorageValue()` (no name) binds the whole storage jar.
        if (name === '') {
            return dumpStorage(storage);
        }

        return storage.getItem(name);
    }

    /** Returns whether this resolver supports the configured storage parameter type. */
    supportsParameter(parameter: MethodParameter): boolean {
        return this.#type.equals(parameter.type);
    }
}
