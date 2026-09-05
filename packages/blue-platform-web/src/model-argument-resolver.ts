/**
 * @author Jeff Rose
 */

import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { isNil } from '@blue/util/types';
import { convertArgumentValue } from './_resolver-util';

/**
 * Browser model argument resolver.
 *
 * Resolves values from route data by direct key lookup and dotted
 * key-path traversal (`profile.name`).
 */
export class BrowserModelValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserModelValueMethodArgumentResolver';
    }

    /** Resolves model data from the current route. */
    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: any): any {
        const data = route?.data;
        if (!data) {
            return undefined;
        }
        if (Object.prototype.hasOwnProperty.call(data, name)) {
            return data[name];
        }
        if (!name.includes('.')) {
            return undefined;
        }
        return this._getPathValue(data, name);
    }

    /** Returns whether this resolver supports model parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.MODEL.equals(parameter.type);
    }

    /** Resolves a dotted path against a nested object graph. */
    private _getPathValue(source: Record<string, any>, path: string): any {
        const tokens = path.split('.');
        const length = tokens.length;
        let value: any = source;

        for (let index = 0; index < length; index++) {
            const token = tokens[index];
            if (isNil(value) || !Object.prototype.hasOwnProperty.call(value, token)) {
                return undefined;
            }
            value = value[token];
        }

        return value;
    }
}
