/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { PathRoute } from '@ndigo/router';
import {
    InvalidParameterMappingError,
    MissingParameterError,
    NoHandlerFoundError,
    NoViewFoundError,
    ParameterConversionError,
    ParameterBindingError,
    RouteBindingError,
} from '../src/error';

describe('dispatcher errors', () => {
    test('NoHandlerFoundError should keep route context', () => {
        const route = new PathRoute('/users/42');
        const error = new NoHandlerFoundError(route);

        expect(error.message).toContain('users/42');
        expect(error.route).toBe(route);
        expect(Object.prototype.toString.call(error)).toContain('NoHandlerFoundError');
    });

    test('NoViewFoundError should keep route and viewName', () => {
        const route = new PathRoute('/users');
        const error = new NoViewFoundError('users-view', route);

        expect(error.viewName).toBe('users-view');
        expect(error.route).toBe(route);
        expect(Object.prototype.toString.call(error)).toContain('NoViewFoundError');
    });

    test('RouteBindingError should support message overload', () => {
        const error = new RouteBindingError('binding failed');

        expect(error.message).toBe('binding failed');
        expect(error.route).toBeNull();
        expect(error.name).toBe('');
    });

    test('RouteBindingError should support route + name overload', () => {
        const route = new PathRoute('/teams/1');
        const error = new RouteBindingError(route, 'teamId');

        expect(error.message).toContain('teamId');
        expect(error.route).toBe(route);
        expect(error.name).toBe('teamId');
    });

    test('ParameterBindingError hierarchy should keep metadata', () => {
        const base = new ParameterBindingError('invalid', 'page', 'list', 'UserController');
        const invalid = new InvalidParameterMappingError('bad mapping', 'id', 'get', 'TeamController');
        const missing = new MissingParameterError('token', 'query', 'read', 'AuthController');
        const conversion = new ParameterConversionError('amount', 'cookie:value', new TypeError('bad number'));

        expect(base.parameterName).toBe('page');
        expect(invalid.name).toBe('InvalidParameterMappingError');
        expect(missing.parameterType).toBe('query');
        expect(missing.required).toBe(true);
        expect(conversion.name).toBe('ParameterConversionError');
        expect(conversion.parameterType).toBe('cookie:value');
        expect(conversion.cause).toBeInstanceOf(TypeError);
    });
});
