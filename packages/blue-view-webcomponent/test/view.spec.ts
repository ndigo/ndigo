import { describe, expect, test } from 'vitest';
import { WebComponentView } from '../src/view';

describe('WebComponentView', () => {
    test('it should create template from name', () => {
        const view = new WebComponentView('user-profile');

        expect(view.template).toBe('<user-profile>');
    });

    test('it should throw for unimplemented _renderTemplate', () => {
        const view = new WebComponentView('test-view');

        expect(() => (view as any)._renderTemplate({}, {})).toThrow('Method not implemented.');
    });

    test('it should throw for unimplemented _renderView', () => {
        const view = new WebComponentView('test-view');

        expect(() => (view as any)._renderView({}, {})).toThrow('Method not implemented.');
    });
});
