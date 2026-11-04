/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import argumemtResolverContext from './assets/argument-resolver-context';
import { Route } from '@ndigo/router';
import {
    AbstractNamedValueMethodArgumentResolver,
    AttributeValueMethodArgumentResolver,
    MethodParameter,
    MethodParameterType,
    QueryValueMethodArgumentResolver,
    RouteValueMethodArgumentResolver,
} from '../src/index';
import { MissingParameterError } from '../src/error';

describe('ArgumentResolver', () => {
    // Mirrors the segment-shaped Route produced by the router for /hello/there.
    const helloThereRequest: Route = {
        id: 1,
        length: 2,
        path: '/hello/there',
        params: { id: '42' },
        raw: '/hello/there',
        data: { name: 'John' },
        attributes: {},
        0: { name: 'hello', raw: 'hello', data: null },
        1: { name: 'there', raw: 'there;name=Jim', data: { name: 'Jim' } },
    } as unknown as Route;

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
            dispatcher.initStrategies(argumemtResolverContext);
        });

        afterEach(() => {
            dispatcher = undefined as unknown as AbstractDispatcher;
        });

        test('it should init resolve query arguments', () => {
            return dispatcher.dispatch(helloThereRequest);
        });
    });

    describe('QueryValueMethodArgumentResolver', () => {
        const resolver = new QueryValueMethodArgumentResolver();

        test('queryValue() with no name binds the whole query bag', () => {
            const query = { name: 'John', page: '2' };
            const route = { data: query, attributes: {} } as unknown as Route;
            expect(resolver.resolveArgument(new MethodParameter(MethodParameterType.QUERY, ''), route, {})).toBe(query);
        });
    });

    describe('AttributeValueMethodArgumentResolver (nested-capable, D-2)', () => {
        const resolver = new AttributeValueMethodArgumentResolver();
        const attributes = { acceptLanguage: 'en', user: { name: 'Jeff', locale: { lang: 'de' } } };

        test('attributeValue() with no name binds the whole framework-context bag', () => {
            const param = new MethodParameter(MethodParameterType.ATTRIBUTE, '');
            expect(resolver.resolveArgument(param, { attributes } as unknown as Route, {})).toBe(attributes);
        });

        test('resolves flat attribute names', () => {
            const param = new MethodParameter(MethodParameterType.ATTRIBUTE, 'acceptLanguage');
            expect(resolver.resolveArgument(param, { attributes } as unknown as Route, {})).toBe('en');
        });

        test('resolves dotted keys by walking the attribute bag', () => {
            const param = new MethodParameter(MethodParameterType.ATTRIBUTE, 'user.locale.lang');
            expect(resolver.resolveArgument(param, { attributes } as unknown as Route, {})).toBe('de');
        });

        test('a missing walk segment resolves nil (defaultValue null), not a throw', () => {
            const param = new MethodParameter(MethodParameterType.ATTRIBUTE, 'user.missing.key');
            expect(resolver.resolveArgument(param, { attributes } as unknown as Route, {})).toBeNull();
        });
    });

    describe('RouteValueMethodArgumentResolver', () => {
        const resolver = new RouteValueMethodArgumentResolver();

        test('routeValue() with no name binds the Route itself', () => {
            const route = { path: '/x', method: 'GET', attributes: {} } as unknown as Route;
            expect(resolver.resolveArgument(new MethodParameter(MethodParameterType.ROUTE, ''), route, {})).toBe(route);
        });

        test('named routeValue binds Route properties, not a literal "route" property', () => {
            const route = { path: '/ab/12', method: 'POST', attributes: {} } as unknown as Route;
            expect(resolver.resolveArgument(new MethodParameter(MethodParameterType.ROUTE, 'path'), route, {})).toBe(
                '/ab/12'
            );
            expect(resolver.resolveArgument(new MethodParameter(MethodParameterType.ROUTE, 'method'), route, {})).toBe(
                'POST'
            );
            // 'route' is not a property of the Route — a named lookup misses.
            expect(resolver.resolveArgument(new MethodParameter(MethodParameterType.ROUTE, 'route'), route, {})).toBe(
                null
            );
        });
    });

    describe('convertType conversion through the shared pipeline (COR-11)', () => {
        const query = new QueryValueMethodArgumentResolver();
        const attribute = new AttributeValueMethodArgumentResolver();
        const numberConvert = { source: String, target: Number };

        test('asNumber(queryValue(...)) converts the raw string to a number', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'age', false, null, numberConvert);
            const route = { data: { age: '42' }, attributes: {} } as unknown as Route;
            expect(query.resolveArgument(param, route, {})).toBe(42);
        });

        test('withConversion(Number, attributeValue(...)) converts raw attribute strings', () => {
            const param = new MethodParameter(MethodParameterType.ATTRIBUTE, 'userId', false, null, numberConvert);
            const route = { attributes: { userId: '7' } } as unknown as Route;
            expect(attribute.resolveArgument(param, route, {})).toBe(7);
        });

        test('default values flow through conversion (asNumber + defaultValue)', () => {
            const param = new MethodParameter(MethodParameterType.QUERY, 'page', false, '3', numberConvert);
            const route = { data: {}, attributes: {} } as unknown as Route;
            expect(query.resolveArgument(param, route, {})).toBe(3);
        });

        test('without a convertType the pipeline stays identity (unchanged behavior)', () => {
            const param = new MethodParameter(MethodParameterType.ATTRIBUTE, 'tag');
            const route = { attributes: { tag: 'x' } } as unknown as Route;
            expect(attribute.resolveArgument(param, route, {})).toBe('x');
        });

        test('a pair convertible only via the String fallback converts instead of throwing (COR-23)', () => {
            // No converter is registered for this source type → Date, but the
            // ConversionService falls back to the String-source converter for
            // the target (the config/env binding convention), so canConvert
            // agrees. Resolution must use the same fallback, not throw.
            const unresolvedSourceType = class UnregisteredSource {};
            const param = new MethodParameter(MethodParameterType.QUERY, 'happenedAt', false, null, {
                source: unresolvedSourceType,
                target: Date,
            });
            const route = { data: { happenedAt: '2024-01-15' }, attributes: {} } as unknown as Route;
            expect(query.resolveArgument(param, route, {})).toEqual(new Date('2024-01-15'));
        });

        test('an exact source→target pair still resolves its own converter (COR-23)', () => {
            // Exact-pair conversion is unchanged: with both the source and the
            // String fallback registered, the exact converter must win.
            const param = new MethodParameter(MethodParameterType.QUERY, 'age', false, null, numberConvert);
            const route = { data: { age: '42' }, attributes: {} } as unknown as Route;
            expect(query.resolveArgument(param, route, {})).toBe(42);
        });
    });

    describe('Required multipart parts (DOC-5)', () => {
        // Mirrors a platform part resolver: the shared named-value pipeline
        // reading an absent part. The `required` flag reaches it via
        // toMethodParameter → MethodParameter (specs in route-params.spec.ts).
        class StubPartResolver extends AbstractNamedValueMethodArgumentResolver {
            protected resolveName(): unknown {
                return undefined;
            }

            supportsParameter(parameter: MethodParameter): boolean {
                return MethodParameterType.REQUEST_PART.equals(parameter.type);
            }
        }

        const stub = new StubPartResolver();
        const route = { path: '/upload', method: 'POST', data: {}, params: {}, attributes: {} } as unknown as Route;

        test('a missing required part throws MissingParameterError (the HTTP 400 path)', () => {
            const param = new MethodParameter(MethodParameterType.REQUEST_PART, 'avatar', true);
            expect(() => stub.resolveArgument(param, route, {})).toThrow(MissingParameterError);
        });

        test('a missing optional part still binds the extractor default — null — unchanged', () => {
            // `defaultValue` is null for file parts; the shared pipeline
            // honors it (the plan's "undefined" wording predates the
            // defaultValue=(null) convention — missing optional values have
            // always bound null here).
            const param = new MethodParameter(MethodParameterType.REQUEST_PART, 'avatar');
            expect(stub.resolveArgument(param, route, {})).toBeNull();
        });
    });
});
