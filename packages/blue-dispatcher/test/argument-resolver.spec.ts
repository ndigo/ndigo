/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, beforeEach, afterEach, expect } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import argumemtResolverContext from './assets/argument-resolver-context';
import { Route } from '@blue/router';
import {
    AttributeValueMethodArgumentResolver,
    MethodParameter,
    MethodParameterType,
    QueryValueMethodArgumentResolver,
    RouteValueMethodArgumentResolver,
} from '../src/index';

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
});
