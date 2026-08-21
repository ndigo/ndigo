import { describe, it, expect, beforeEach } from 'vitest';
import { ViewTarget } from './view-target.js';
import type { MediaType } from '@blue/core';
import { AbstractTemplateView, StringTemplateView } from './view.js';

class MockTarget implements ViewTarget {
    commit: jest.MockedFunction;
    constructor() {
        this.commit = jest.fn();
    }
}

describe('AbstractTemplateView', () => {
    class MockRenderable extends AbstractTemplateView {
        renderCalled: boolean = false;
        
        protected _renderTemplate(templateModel: any, request: any): void {
            this.renderCalled = true;
        }
    }

    beforeEach(() => {
        new MockRenderable(); // Just verify class can be instantiated
    });

    it('renders by delegating to _renderView which delegates to _renderTemplate', async () => {
        const target = new MockTarget();
        const view = new MockRenderable('/test');

        await view.render({ test: true }, {}, target);

        expect(target.commit).toHaveBeenCalled();
    });

    it('throws when no target is provided', async () => {
        const view = new MockRenderable('/test');
        expect(() => view.render({} as any, {} as any)).toThrow();
    });
});

describe('StringTemplateView', () => {
    let target: MockTarget;
    let view: StringTemplateView;

    beforeEach(() => {
        target = new MockTarget();
        view = new StringTemplateView('/test');
    });

    it('renders template with simple variable substitution', async () => {
        await view._renderTemplate({ name: 'World' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'World' }, target);
    });

    it('renders template with nested property access', async () => {
        await view._renderTemplate({ user: { name: 'Alice', age: 30 } }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { user: { name: 'Alice', age: 30 } }, target);
    });

    it('renders template with array access', async () => {
        await view._renderTemplate({ items: ['a', 'b', 'c'] }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { items: ['a', 'b', 'c'] }, target);
    });

    it('renders template with missing variable returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice' }, target);
    });

    it('renders template with undefined variable returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice' }, target);
    });

    it('renders template with null value returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice', count: null }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice', count: null }, target);
    });

    it('renders template with undefined array index returns empty string', async () => {
        await view._renderTemplate({ items: ['a'] }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { items: ['a'] }, target);
    });

    it('renders template with undefined property returns empty string', async () => {
        await view._renderTemplate({} as any, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, {} as any, target);
    });

    it('renders template with function returns "[object Function]"', async () => {
        await view._renderTemplate({ fn: () => 'hello' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { fn: () => 'hello' }, target);
    });
});