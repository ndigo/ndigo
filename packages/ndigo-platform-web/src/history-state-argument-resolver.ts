/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
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

    /** Retrieves a value from `history.state`, or the whole state when no name is given. */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        // `historyStateValue()` (no name) binds the whole history.state;
        // named reads are nested-capable (D-2).
        const state = globalThis.history?.state;
        return name === '' ? state : readDottedValue(state, name);
    }

    /** Returns whether this resolver supports history-state parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.HISTORY_STATE.equals(parameter.type);
    }
}
