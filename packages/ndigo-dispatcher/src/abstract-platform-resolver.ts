/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { isNil } from '@ndigo/util/types';
import { Route } from '@ndigo/router';
import { DataBinder, MutablePropertyValues, PropertyValues } from '@ndigo/core';
import { AbstractNamedValueMethodArgumentResolver } from './argument-resolver';
import { convertArgumentValue } from './argument-value-converter';
import { MethodParameter, MethodParameterType, type DataBindingSource } from './parameters';

/**
 * Function signature for platform-specific argument value conversion.
 *
 * Each platform provides its own implementation (backed by ConversionService)
 * so that the shared `resolveArgument` pipeline can remain platform-agnostic.
 */
export type ConvertArgumentValueFn = (
    convertType: { source: unknown; target: unknown } | undefined,
    value: unknown,
    parameter: MethodParameter,
    route: Route,
    mapping: unknown,
    registry?: unknown,
    options?: unknown
) => unknown;

/**
 * Shared base class for platform argument resolvers.
 *
 * Eliminates the 11 copies of the `resolveArgument` converter pipeline
 * that were previously duplicated across `@ndigo/platform-web` and
 * `@ndigo/platform-node`.
 *
 * Subclasses only need to implement:
 * - `resolveName()` — where to fetch the raw value
 * - `supportsParameter()` — which `MethodParameterType` to match
 *
 * The two boilerplate-heavy families extend a narrower base instead, where
 * each platform declares only its data:
 * - whole-source binding ({@link AbstractDataBindingArgumentResolver}) —
 *   the platform's bindable-source table and `getSourceData` lookup
 * - cookie values ({@link AbstractCookieValueArgumentResolver}) — the
 *   platform's whole-jar lookup
 */
export abstract class AbstractPlatformArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #convertFn: ConvertArgumentValueFn;

    /**
     * Creates a platform argument resolver.
     *
     * @param convertFn - Platform-specific `convertArgumentValue` function.
     */
    constructor(convertFn: ConvertArgumentValueFn) {
        super();
        this.#convertFn = convertFn;
    }

    /**
     * Resolves and converts a method argument value.
     *
     * Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → extractor validation → nil check.
     *
     * The `parameter.convert` hook (installed by `validatedBy` for Zod
     * validation, AD-07) runs after type conversion so schemas see coerced
     * values. Without this invocation the hook was dead on every resolver
     * extending this base — only the BIND path invoked it.
     */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        const resolveValue = (v: unknown) => v ?? parameter.defaultValue,
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            convertedValue = this.#convertFn(parameter.convertType, value, parameter, route, mapping),
            validatedValue = parameter.convert ? parameter.convert(convertedValue) : convertedValue;

        if (isNil(validatedValue) && parameter.required) {
            this.handleMissingValue(parameter);
        }

        return validatedValue;
    }

    /**
     * Whole-source data-binding pipeline (D-3), shared by the browser and
     * Node data-binding resolvers.
     *
     * source data → prefix filter → `DataBinder` (flat keys → nested object
     * by keypath) → convertType conversion → Zod `convert` hook → required
     * check. With a target constructor (`dataBinderValue(source, Target)`)
     * the value is bound into a real instance of the target; without one,
     * a plain nested object.
     *
     * An absent whole source (no data at all) is treated as a missing value:
     * required → {@link MissingParameterError} (HTTP 400), else the
     * extractor's default. An empty-but-present source binds successfully to
     * an empty object — model-attribute binding semantics.
     *
     * @param parameter - The method parameter being bound.
     * @param route - The current route.
     * @param mapping - The route handler mapping.
     * @param getSourceData - Platform source lookup (the resolver's fixed
     *   switch on literal source names — never an arbitrary dotted walk).
     * @returns The bound, converted, and validated value.
     */
    protected resolveBoundArgument(
        parameter: MethodParameter,
        route: Route,
        mapping: unknown,
        getSourceData: (source: string, route: Route) => Record<string, unknown> | undefined
    ): unknown {
        const rawData = getSourceData(parameter.name, route);
        if (rawData == null) {
            if (parameter.required) {
                this.handleMissingValue(parameter);
            }
            return parameter.defaultValue;
        }

        const filteredData = filterByPrefix(rawData, parameter.prefix);
        const target: object = parameter.target ? new parameter.target() : {};
        const binder = new DataBinder(target, parameter.name);
        const mpv = new MutablePropertyValues();

        for (const [key, value] of Object.entries(filteredData)) {
            mpv.addPropertyValue(key, value);
        }

        binder.bind(mpv as PropertyValues);
        // DataBinder leaves `result` unset when no property applied; an
        // empty-but-present source still yields the (empty) target.
        const bound = binder.result ?? target;

        return this.resolveConvertedValue(parameter, bound, route, mapping, target);
    }

    /**
     * Converts + validates a resolved (or bound) value and preserves a target
     * instance across the validation step (D-3/D-6).
     *
     * Pipeline: defaultValue fallback → convertType conversion → Zod
     * `convert` hook → target rehydration → required check.
     *
     * A converting validator (Zod parse, class-transformer, …) returns a new
     * plain object — e.g. zod's `safeParse` result.data. With a target,
     * rehydrate the parsed, coerced, whitelist-stripped shape onto the
     * instance so `instanceof` survives the validation step.
     *
     * @param parameter - The method parameter being resolved.
     * @param raw - The raw (bound or parsed-part) value.
     * @param route - The current route.
     * @param mapping - The route handler mapping.
     * @param instance - The target instance to rehydrate, when the extractor
     *   carries a target constructor; `undefined` for plain-object results.
     * @returns The converted and validated value.
     */
    protected resolveConvertedValue(
        parameter: MethodParameter,
        raw: unknown,
        route: Route,
        mapping: unknown,
        instance?: object
    ): unknown {
        const convertedValue = this.#convertFn(
            parameter.convertType,
            raw ?? parameter.defaultValue,
            parameter,
            route,
            mapping
        );

        // Post-bind validation/conversion (e.g. Zod via validatedBy, AD-07).
        let validatedValue = parameter.convert ? parameter.convert(convertedValue) : convertedValue;

        if (instance && validatedValue !== convertedValue && validatedValue && typeof validatedValue === 'object') {
            const target = instance as Record<string, unknown>;
            const parsed = validatedValue as Record<string, unknown>;
            for (const key of Object.keys(target)) {
                delete target[key];
            }
            Object.assign(target, parsed);
            validatedValue = instance;
        }

        const finalValue = validatedValue ?? parameter.defaultValue;

        if (isNil(finalValue) && parameter.required) {
            this.handleMissingValue(parameter);
        }

        return finalValue;
    }
}

/**
 * Shared base for whole-source data-binding resolvers (`dataBinderValue`,
 * D-3). The browser and Node resolvers had the same `resolveArgument`
 * override, the same never-called `resolveName` stub, and the same
 * bindable-source `supportsParameter` check — the only platform knowledge is
 * the source table and the source lookup, which subclasses declare.
 *
 * @see {@link AbstractPlatformArgumentResolver.resolveBoundArgument}
 */
export abstract class AbstractDataBindingArgumentResolver extends AbstractPlatformArgumentResolver {
    /** Whole-source names this platform can bind from. */
    protected abstract readonly bindableSources: readonly DataBindingSource[];

    /**
     * Creates a whole-source data-binding resolver.
     */
    constructor() {
        super(convertArgumentValue);
    }

    /**
     * Fetches the whole wire source identified by a bindable-source name.
     *
     * @param source - One of {@link bindableSources}.
     * @param route - The current route.
     * @returns The flat source data, or `undefined` when the source is
     *   absent/unavailable for this platform.
     */
    protected abstract getSourceData(source: string, route: Route): Record<string, unknown> | undefined;

    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        return this.resolveBoundArgument(parameter, route, mapping, (source, currentRoute) =>
            this.getSourceData(source, currentRoute)
        );
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return this.bindableSources.some((source) => MethodParameterType.data(source).equals(parameter.type));
    }

    protected resolveName(): null {
        // Whole-source binding overrides `resolveArgument` entirely; this stub
        // satisfies the abstract named-value contract and is never called.
        return null;
    }
}

/**
 * Shared base for cookie-value resolvers: the whole-jar case
 * (`cookieValue()` with no name) and the cookie parameter match were
 * duplicated across the browser and Node resolvers, which differed only in
 * how the cookie jar is read.
 */
export abstract class AbstractCookieValueArgumentResolver extends AbstractPlatformArgumentResolver {
    /**
     * Creates a cookie-value resolver.
     */
    constructor() {
        super(convertArgumentValue);
    }

    /**
     * Reads the whole cookie jar for the current route.
     *
     * @param route - The current route.
     * @returns The jar keyed by cookie name, or `undefined` when no
     *   request/cookies are available.
     */
    protected abstract getCookieJar(route: Route): Record<string, unknown> | undefined;

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const jar = this.getCookieJar(route);
        if (name === '') {
            // `cookieValue()` (no name) binds the whole cookie jar.
            return jar;
        }

        const value = jar?.[name];
        return typeof value === 'string' ? value : undefined;
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.COOKIE.equals(parameter.type);
    }
}

/**
 * Removes a prefix from keys before binding nested values.
 * @param data - The flat source data.
 * @param prefix - The key prefix to filter by (stripped from kept keys).
 * @returns The filtered record.
 */
function filterByPrefix(data: Record<string, unknown>, prefix: string | null): Record<string, unknown> {
    if (!prefix) {
        return data;
    }

    const filtered: Record<string, unknown> = {};
    const prefixLength = prefix.length;

    for (const [key, value] of Object.entries(data)) {
        if (key.startsWith(prefix)) {
            filtered[key.slice(prefixLength)] = value;
        }
    }

    return filtered;
}
