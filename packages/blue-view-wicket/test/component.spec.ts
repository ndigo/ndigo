import { describe, expect, it, vi } from 'vitest';
import { IllegalStateError } from '@blue/core';
import { MutableModel, StaticModel } from '@blue/reactive';
import { ComponentPhase, WicketComponent } from '../src/component';
import type { Behavior } from '../src/behavior';

class TestComponent extends WicketComponent<string> {
    renderCalls: Array<{ dom: unknown; container: unknown }> = [];
    initialized = false;
    configured = false;
    detached = false;
    removed = false;

    protected render(dom: unknown, container: unknown): void {
        this.renderCalls.push({ dom, container });
    }

    protected onInitialize(): void {
        this.initialized = true;
    }

    protected onConfigure(): void {
        this.configured = true;
    }

    protected onDetach(): void {
        this.detached = true;
    }

    protected onRemove(): void {
        this.removed = true;
    }
}

describe('WicketComponent', () => {
    it('sets id and default model', () => {
        const component = new TestComponent('alpha');

        expect(component.id).toBe('alpha');
        expect(component.model).toBeInstanceOf(StaticModel);
        expect(component.model.get()).toBeUndefined();
    });

    it('stores custom model when provided', () => {
        const model = new StaticModel('value');
        const component = new TestComponent('alpha', model);

        expect(component.model).toBe(model);
    });

    it('exposes id getter', () => {
        const component = new TestComponent('beta');

        expect(component.id).toBe('beta');
    });

    it('supports model getter and setter', () => {
        const component = new TestComponent('gamma');
        const model = new MutableModel('initial');

        component.model = model;

        expect(component.model).toBe(model);
    });

    it('starts in the Created phase', () => {
        const component = new TestComponent('alpha');

        expect(component.phase).toBe(ComponentPhase.Created);
    });

    it('defaults parent to null and allows setting', () => {
        const component = new TestComponent('alpha');
        const parent = new TestComponent('parent');

        expect(component.parent).toBeNull();

        component.parent = parent;

        expect(component.parent).toBe(parent);
    });

    it('defaults visible to true and allows updates', () => {
        const component = new TestComponent('alpha');

        expect(component.visible).toBe(true);

        component.visible = false;

        expect(component.visible).toBe(false);
    });

    it('defaults enabled to true and allows updates', () => {
        const component = new TestComponent('alpha');

        expect(component.enabled).toBe(true);

        component.enabled = false;

        expect(component.enabled).toBe(false);
    });

    it('starts with no behaviors', () => {
        const component = new TestComponent('alpha');

        expect(component.behaviors).toHaveLength(0);
    });

    it('adds a behavior and calls bind', () => {
        const component = new TestComponent('alpha');
        const bind = vi.fn();
        const behavior: Behavior = { bind };

        component.addBehavior(behavior);

        expect(component.behaviors).toHaveLength(1);
        expect(bind).toHaveBeenCalledWith(component);
    });

    it('removes a behavior, calls unbind, and returns true', () => {
        const component = new TestComponent('alpha');
        const unbind = vi.fn();
        const behavior: Behavior = { unbind };

        component.addBehavior(behavior);

        expect(component.removeBehavior(behavior)).toBe(true);
        expect(component.behaviors).toHaveLength(0);
        expect(unbind).toHaveBeenCalledWith(component);
    });

    it('returns false when removing unknown behavior', () => {
        const component = new TestComponent('alpha');
        const behavior: Behavior = {};

        expect(component.removeBehavior(behavior)).toBe(false);
    });

    it('returns id for root path', () => {
        const component = new TestComponent('root');

        expect(component.getPath()).toBe('root');
    });

    it('returns colon separated path with parent', () => {
        const parent = new TestComponent('parent');
        const child = new TestComponent('child');
        child.parent = parent;

        expect(child.getPath()).toBe('parent:child');
    });

    it('initializes once and sets phase', () => {
        const component = new TestComponent('alpha');

        component.initialize();

        expect(component.initialized).toBe(true);
        expect(component.phase).toBe(ComponentPhase.Initialized);
    });

    it('throws when initializing twice', () => {
        const component = new TestComponent('alpha');
        component.initialize();

        expect(() => component.initialize()).toThrow(IllegalStateError);
    });

    it('configures and updates phase', () => {
        const component = new TestComponent('alpha');

        component.configure();

        expect(component.configured).toBe(true);
        expect(component.phase).toBe(ComponentPhase.Configured);
    });

    it('renders when visible', () => {
        const component = new TestComponent('alpha');
        const dom = {};
        const container = {};

        component.renderComponent(dom, container);

        expect(component.renderCalls).toHaveLength(1);
        expect(component.renderCalls[0]).toEqual({ dom, container });
        expect(component.phase).toBe(ComponentPhase.Rendered);
    });

    it('skips rendering when not visible', () => {
        const component = new TestComponent('alpha');
        component.visible = false;

        component.renderComponent({}, {});

        expect(component.renderCalls).toHaveLength(0);
    });

    it('calls behavior hooks during render', () => {
        const component = new TestComponent('alpha');
        const beforeRender = vi.fn();
        const afterRender = vi.fn();
        const behavior: Behavior = { beforeRender, afterRender };

        component.addBehavior(behavior);
        component.renderComponent({}, {});

        expect(beforeRender).toHaveBeenCalledWith(component);
        expect(afterRender).toHaveBeenCalledWith(component);
    });

    it('detaches behaviors and runs onDetach', () => {
        const component = new TestComponent('alpha');
        const detach = vi.fn();
        const behavior: Behavior = { detach };

        component.addBehavior(behavior);
        component.detach();

        expect(detach).toHaveBeenCalledWith(component);
        expect(component.detached).toBe(true);
        expect(component.phase).toBe(ComponentPhase.Detached);
    });

    it('removes component, clears parent and behaviors', () => {
        const component = new TestComponent('alpha');
        const parent = new TestComponent('parent');
        const unbind = vi.fn();
        const behavior: Behavior = { unbind };

        component.parent = parent;
        component.addBehavior(behavior);

        component.remove();

        expect(component.parent).toBeNull();
        expect(component.behaviors).toHaveLength(0);
        expect(component.phase).toBe(ComponentPhase.Removed);
        expect(unbind).toHaveBeenCalledWith(component);
        expect(component.removed).toBe(true);
    });

    it('exposes Symbol.toStringTag', () => {
        const component = new TestComponent('alpha');

        expect(Object.prototype.toString.call(component)).toBe('[object WicketComponent]');
    });
});
