/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { PathRoute } from '@ndigo/router';
import { DefaultRouteToViewNameTranslator } from '../src/route-to-view-name-translator';

describe('DefaultRouteToViewNameTranslator', () => {
    test('it should build view name from route path', () => {
        const translator = new DefaultRouteToViewNameTranslator();
        const route = new PathRoute('/users/42');

        expect(translator.getViewName(route)).toBe('users/42');
    });

    test('it should apply prefix and suffix', () => {
        const translator = new DefaultRouteToViewNameTranslator();
        translator.prefix = '/views';
        translator.suffix = '.html';

        const route = new PathRoute('/users');
        expect(translator.getViewName(route)).toBe('/viewsusers.html');
    });

    test('it should apply custom separator', () => {
        const translator = new DefaultRouteToViewNameTranslator();
        translator.separator = '-';

        const route = new PathRoute('/users/42');
        expect(translator.getViewName(route)).toBe('users-42');
    });
});
