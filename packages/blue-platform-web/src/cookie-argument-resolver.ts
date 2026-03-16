/**
 * @author Jeff Rose
 */

import { AbstractNamedValueMethodArgumentResolver, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { defaultTo } from '@blue/util/logic';
import { isNil } from '@blue/util/types';
import Cookies from './cookies';
import { ArgumentValueConverter, identityArgumentValueConverter } from './argument-value-converter';
import { convertArgumentValue } from './_resolver-util';

/**
 * Abstract base class for resolving cookie-backed method arguments.
 */
export abstract class AbstractCookieValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;

    constructor(converter: ArgumentValueConverter = identityArgumentValueConverter) {
        super();
        this.#converter = converter;
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const resolveValue = defaultTo(parameter.defaultValue),
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            converter = parameter.convert ?? this.#converter,
            convertedValue = convertArgumentValue(converter, value, parameter, route, mapping);

        isNil(convertedValue) && parameter.required && this.handleMissingValue(parameter.name);

        return convertedValue;
    }

    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        void parameter;
        void route;
        void mapping;

        return this.getCookieValue(name);
    }

    protected abstract getCookieValue(name: string): string | undefined;

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.COOKIE.equals(parameter.type);
    }
}

/**
 * Browser cookie argument resolver using `document.cookie` parsing.
 */
export class BrowserCookieValueMethodArgumentResolver extends AbstractCookieValueMethodArgumentResolver {
    constructor(converter: ArgumentValueConverter = identityArgumentValueConverter) {
        super(converter);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserCookieValueMethodArgumentResolver';
    }

    protected getCookieValue(name: string): string | undefined {
        const value = Cookies.get(name);

        return typeof value === 'string' ? value : undefined;
    }
}
