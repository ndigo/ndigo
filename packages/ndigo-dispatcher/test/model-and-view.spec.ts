/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { ModelAndView } from '../src/model-and-view';

describe('ModelAndView', () => {
    test('it should initialize from a view name', () => {
        const mav = new ModelAndView('home');

        expect(mav.viewName).toBe('home');
        expect(mav.view).toBeNull();
        expect(mav.hasView).toBe(true);
    });

    test('it should initialize with model data', () => {
        const model = { foo: 'bar' };
        const mav = new ModelAndView('home', model);

        expect(mav.model).toBe(model);
    });

    test('it should expose Symbol.toStringTag with view name', () => {
        const mav = new ModelAndView('dashboard');

        expect(Object.prototype.toString.call(mav)).toContain('ModelAndView:dashboard');
    });
});
