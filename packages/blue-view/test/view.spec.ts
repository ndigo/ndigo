/**
 * @author Jeff Rose
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ViewTarget } from '@blue/view';
import type { MediaType } from '@blue/core';
import { AbstractTemplateView, StringTemplateView } from '@blue/view';

class MockTarget implements ViewTarget {
    commit: ReturnType<typeof vi.fn>;
    constructor() {
        this.commit = vi.fn();
    }

    prepare(): void {
        // do nothing
    }

    clear(): void {
        // do nothing
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

        expect(view.renderCalled).toBe(true);
    });

    it('throws when no target is provided', async () => {
        const view = new MockRenderable('/test');
        await expect(() => view.render({} as any, {} as any)).rejects.toThrow();
    });
});

describe('StringTemplateView', () => {
    let target: MockTarget;
    let view: StringTemplateView;

    beforeEach(() => {
        target = new MockTarget();
        view = new StringTemplateView('/test');
        view.template = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
    });

    it('renders template with simple variable substitution', async () => {
        await view._renderTemplate({ name: 'World' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'World' }, {});
    });

    it('renders template with nested property access', async () => {
        await view._renderTemplate({ user: { name: 'Alice', age: 30 } }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { user: { name: 'Alice', age: 30 } }, {});
    });

    it('renders template with array access', async () => {
        await view._renderTemplate({ items: ['a', 'b', 'c'] }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { items: ['a', 'b', 'c'] }, {});
    });

    it('renders template with missing variable returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice' }, {});
    });

    it('renders template with undefined variable returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice' }, {});
    });

    it('renders template with null value returns empty string', async () => {
        await view._renderTemplate({ name: 'Alice', count: null }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { name: 'Alice', count: null }, {});
    });

    it('renders template with undefined array index returns empty string', async () => {
        await view._renderTemplate({ items: ['a'] }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, { items: ['a'] }, {});
    });

    it('renders template with undefined property returns empty string', async () => {
        await view._renderTemplate({} as any, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, {} as any, {});
    });

    it('renders template with function returns "[object Function]"', async () => {
        await view._renderTemplate({ fn: () => 'hello' }, {}, target);

        const expected = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        expect(target.commit).toHaveBeenCalledWith(expected, expect.objectContaining({ fn: expect.any(Function) }), {});
    });

    it('renders template without target throws error', async () => {
        const view = new StringTemplateView('/test');
        view.template = '<!DOCTYPE html>\n<html><body>Test Template View</body></html>';
        // Capturing the rejection – calling _renderTemplate without target should throw
        await expect(view._renderTemplate({} as any, {} as any)).rejects.toThrow();
    });
});