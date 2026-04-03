import { describe, expect, it, vi } from 'vitest';
import { EventBehavior } from '../src/event-behavior';

describe('EventBehavior', () => {
    it('exposes Symbol.toStringTag as EventBehavior', () => {
        const behavior = new EventBehavior('click', vi.fn());

        expect(Object.prototype.toString.call(behavior)).toBe('[object EventBehavior]');
    });

    it('returns the eventName getter value', () => {
        const behavior = new EventBehavior('submit', vi.fn());

        expect(behavior.eventName).toBe('submit');
    });

    it('attaches a listener and calls handler when event fires', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);
        const element = document.createElement('button');

        behavior.attachTo(element);
        element.dispatchEvent(new Event('click'));

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('passes the Event object to the handler', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);
        const element = document.createElement('button');

        behavior.attachTo(element);
        const event = new Event('click');
        element.dispatchEvent(event);

        expect(handler).toHaveBeenCalledWith(event);
    });

    it('replaces the previous listener when attaching again', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);
        const firstElement = document.createElement('button');
        const secondElement = document.createElement('button');

        behavior.attachTo(firstElement);
        firstElement.dispatchEvent(new Event('click'));

        behavior.attachTo(secondElement);
        firstElement.dispatchEvent(new Event('click'));
        secondElement.dispatchEvent(new Event('click'));

        expect(handler).toHaveBeenCalledTimes(2);
    });

    it('attaches to component._element during afterRender', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);
        const element = document.createElement('button');

        behavior.afterRender({ _element: element });
        element.dispatchEvent(new Event('click'));

        expect(handler).toHaveBeenCalledTimes(1);
    });

    it('does nothing in afterRender when no _element exists', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);

        behavior.afterRender({});

        expect(handler).not.toHaveBeenCalled();
    });

    it('detaches the listener so handler is no longer called', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);
        const element = document.createElement('button');

        behavior.attachTo(element);
        behavior.detach();
        element.dispatchEvent(new Event('click'));

        expect(handler).not.toHaveBeenCalled();
    });

    it('allows detach to be called when not attached', () => {
        const behavior = new EventBehavior('click', vi.fn());

        expect(() => behavior.detach()).not.toThrow();
    });

    it('unbind removes the listener like detach', () => {
        const handler = vi.fn();
        const behavior = new EventBehavior('click', handler);
        const element = document.createElement('button');

        behavior.attachTo(element);
        behavior.unbind();
        element.dispatchEvent(new Event('click'));

        expect(handler).not.toHaveBeenCalled();
    });

    it('allows unbind to be called when not attached', () => {
        const behavior = new EventBehavior('click', vi.fn());

        expect(() => behavior.unbind()).not.toThrow();
    });
});
