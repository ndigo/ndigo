/**
 * @author Jeff Rose
 */

import { MethodParameter, MethodParameterType, AbstractNamedValueMethodArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { defaultTo } from '@blue/util/logic';
import { isNil } from '@blue/util/types';
import { ArgumentValueConverter, identityArgumentValueConverter } from './argument-value-converter';

/**
 * Abstract base class for resolving model-backed method arguments.
 */
export abstract class AbstractModelValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;

    constructor(converter: ArgumentValueConverter = identityArgumentValueConverter) {
        super();
        this.#converter = converter;
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const resolveValue = defaultTo(parameter.defaultValue),
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            converter = parameter.convert ?? this.#converter,
            convertedValue = converter(value, {
                name: parameter.name,
                parameter,
                route,
                mapping,
            });

        isNil(convertedValue) && parameter.required && this.handleMissingValue(parameter.name);

        return convertedValue;
    }

    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        void parameter;
        void mapping;

        return this.resolveModelValue(name, route);
    }

    protected abstract resolveModelValue(name: string, route: Route): any;

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.MODEL.equals(parameter.type);
    }
}

/**
 * Browser model argument resolver.
 *
 * Resolves values from route data by:
 * 1) direct key lookup (`profile`)
 * 2) dotted key-path lookup (`profile.name`)
 */
export class BrowserModelValueMethodArgumentResolver extends AbstractModelValueMethodArgumentResolver {
    constructor(converter: ArgumentValueConverter = identityArgumentValueConverter) {
        super(converter);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserModelValueMethodArgumentResolver';
    }

    protected resolveModelValue(name: string, route: Route): any {
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
