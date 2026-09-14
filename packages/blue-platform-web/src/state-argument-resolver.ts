/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';

/**
 * Browser history state argument resolver.
 */
export class BrowserStateValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserStateValueMethodArgumentResolver';
    }

    /** Retrieves a value from `history.state` if it exists. */
    protected resolveName(name: string, _parameter: MethodParameter, _route: Route, _mapping: unknown): unknown {
        const state = globalThis.history?.state;
        return state && Object.prototype.hasOwnProperty.call(state, name) ? state[name] : undefined;
    }

    /** Returns whether this resolver supports history-state parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.STATE.equals(parameter.type);
    }
}
