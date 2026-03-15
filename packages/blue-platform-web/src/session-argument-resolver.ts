/**
 * @author Jeff Rose
 */

import { AbstractNamedValueMethodArgumentResolver, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { defaultTo } from '@blue/util/logic';
import { isNil } from '@blue/util/types';

/**
 * Abstract base class for resolving session-backed method arguments.
 */
export abstract class AbstractSessionValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
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

        return this.getSessionValue(name);
    }

    protected abstract getSessionValue(name: string): string | null;

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.SESSION.equals(parameter.type);
    }
}

/**
 * Browser session argument resolver using `sessionStorage`.
 */
export class BrowserSessionValueMethodArgumentResolver extends AbstractSessionValueMethodArgumentResolver {
    get [Symbol.toStringTag](): string {
        return 'BrowserSessionValueMethodArgumentResolver';
    }

    protected getSessionValue(name: string): string | null {
        const storage = globalThis.sessionStorage;

        return storage ? storage.getItem(name) : null;
    }
}
