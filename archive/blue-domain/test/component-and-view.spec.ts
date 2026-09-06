import { describe, expect, test } from 'vitest';
import { ComponentAndView } from '../src/component-and-view';
import { GenericDomainComponent } from '../src/component';

describe('ComponentAndView', () => {
    test('it should expose component and view name', () => {
        const component = new GenericDomainComponent();
        component.init('domain-component');

        const modelAndView = new ComponentAndView();
        modelAndView.viewName = 'dashboard';
        modelAndView.component = component;

        expect(modelAndView.component).toBe(component);
        expect(modelAndView.viewName).toBe('dashboard');
    });

    test('it should expose Symbol.toStringTag with view name', () => {
        const modelAndView = new ComponentAndView();
        modelAndView.viewName = 'settings';

        expect(modelAndView[Symbol.toStringTag]).toBe('ComponentAndView:settings');
    });
});
