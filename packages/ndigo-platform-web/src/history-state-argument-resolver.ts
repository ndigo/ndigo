/**
 * Argument resolver that reads history state.
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    readDottedValue,
    convertArgumentValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';

/**
 * Browser history-state argument resolver.
 */
export class BrowserHistoryStateValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserHistoryStateValueMethodArgumentResolver';
    }

    /**
     * Retrieves a value from `history.state`, or the whole state when no name is given.
     *
     * @param name - The dotted state path, or `''` for the whole state.
     * @param _parameter - The method parameter (unused).
     * @param _route - The current route (unused).
     * @param _mapping - The route mapping (unused).
     * @returns The resolved state value.
     */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        // `historyStateValue()` (no name) binds the whole history.state;
        // named reads are nested-capable (D-2).
        const state = globalThis.history?.state;
        return name === '' ? state : readDottedValue(state, name);
    }

    /**
     * Returns whether this resolver supports history-state parameters.
     *
     * @param parameter - The method parameter to test.
     * @returns Whether the parameter type matches.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.HISTORY_STATE.equals(parameter.type);
    }
}
