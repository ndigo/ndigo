/**
 * @author Jeff Rose
 */

import { MethodParameter, MethodParameterType, AbstractNamedValueMethodArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { defaultTo } from '@blue/util/logic';
import { isNil } from '@blue/util/types';

/**
 * Abstract base class for resolving history-state-backed method arguments.
 */
export abstract class AbstractStateValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const resolveValue = defaultTo(parameter.defaultValue),
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping));

        isNil(value) && parameter.required && this.handleMissingValue(parameter.name);

        return value;
    }

    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        void parameter;
        void route;
        void mapping;

        return this.getStateValue(name);
    }

    protected abstract getStateValue(name: string): any;

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.STATE.equals(parameter.type);
    }
}

/**
 * Browser history state argument resolver.
 */
export class BrowserStateValueMethodArgumentResolver extends AbstractStateValueMethodArgumentResolver {
    get [Symbol.toStringTag](): string {
        return 'BrowserStateValueMethodArgumentResolver';
    }

    protected getStateValue(name: string): any {
        const state = globalThis.history?.state;

        return state && Object.prototype.hasOwnProperty.call(state, name) ? state[name] : undefined;
    }
}
