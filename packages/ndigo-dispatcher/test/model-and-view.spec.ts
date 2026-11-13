import { describe, test, expect } from 'vitest';
import { ModelAndView } from '../src/model-and-view';
import type { View, ViewTarget } from '@ndigo/view';

class TestView implements View {
    mediaType = null;
    async render(): Promise<void> {
        // Shape only.
    }
}

class NullableView extends ModelAndView {
    constructor() {
        super('placeholder');
        this.viewName = null;
    }
}

const target = (): ViewTarget => ({
    prepare: () => undefined,
    commit: () => undefined,
    clear: () => undefined,
});

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

    test('it should accept an array model for array-shaped views', () => {
        const messages = [{ version: '1.0', createSurface: { surfaceId: 's1' } }];
        const mav = new ModelAndView('a2ui', messages);

        expect(mav.model).toBe(messages);
    });

    test('it should expose Symbol.toStringTag with view name', () => {
        const mav = new ModelAndView('dashboard');

        expect(Object.prototype.toString.call(mav)).toContain('ModelAndView:dashboard');
    });

    test('it should treat a realized view as authoritative and leave the name unset', () => {
        const view = new TestView();
        const mav = new ModelAndView(view);

        expect(mav.view).toBe(view);
        // A realized view must never be re-resolved, even if some view class
        // sets `name`: before this fix the name was copied here and the
        // resolver chain silently replaced the instance the handler built.
        expect(mav.viewName).toBeNull();
        expect(mav.hasView).toBe(true);
    });

    test('it should accept an explicit view target', () => {
        const viewTarget = target();
        const mav = new ModelAndView('footer', null, { viewTarget });

        expect(mav.viewTarget).toBe(viewTarget);
    });

    test('it should report hasView correctly when neither a view nor a name is set', () => {
        const mav = new NullableView();

        // `typeof null === 'object'`, so a `typeof` probe reported `true`
        // here and defeated `_applyDefaultViewName`.
        expect(mav.hasView).toBe(false);
    });

    test('it should report hasView for a view instance', () => {
        const mav = new ModelAndView(new TestView());

        expect(mav.hasView).toBe(true);
    });
});
