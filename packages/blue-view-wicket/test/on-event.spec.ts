import '@tsmetadata/polyfill';
import { describe, expect, it, vi } from 'vitest';
import { LinkedomDOMProvider } from '@blue/dom';
import { StaticModel } from '@blue/reactive';
import { getEventBindings, hasEventBindings, onEvent } from '../src/on-event';
import { Label } from '../src/label';
import { EventBehavior } from '../src/event-behavior';

const createDomEvent = (element: Element, type: string): Event => {
    const ViewEvent = element.ownerDocument?.defaultView?.Event;
    return ViewEvent ? new ViewEvent(type) : new Event(type);
};

describe('onEvent', () => {
    describe('metadata', () => {
        it('getEventBindings returns empty map for class without decorators', () => {
            class PlainLabel extends Label<string> {}

            expect(getEventBindings(PlainLabel)).toEqual(new Map());
        });

        it('getEventBindings returns bindings for decorated class', () => {
            class DecoratedLabel extends Label<string> {
                @onEvent('click')
                handleClick(): void {}
            }

            expect(getEventBindings(DecoratedLabel)).toEqual(new Map([['handleClick', 'click']]));
        });

        it('getEventBindings returns bindings for instance of decorated class', () => {
            class DecoratedLabel extends Label<string> {
                @onEvent('click')
                handleClick(): void {}
            }

            const instance = new DecoratedLabel('label');

            expect(getEventBindings(instance)).toEqual(new Map([['handleClick', 'click']]));
        });

        it('hasEventBindings returns false for class without decorators', () => {
            class PlainLabel extends Label<string> {}

            expect(hasEventBindings(PlainLabel)).toBe(false);
        });

        it('hasEventBindings returns true for class with decorators', () => {
            class DecoratedLabel extends Label<string> {
                @onEvent('click')
                handleClick(): void {}
            }

            expect(hasEventBindings(DecoratedLabel)).toBe(true);
        });

        it('getEventBindings returns multiple bindings when multiple methods are decorated', () => {
            class MultiLabel extends Label<string> {
                @onEvent('click')
                handleClick(): void {}

                @onEvent('blur')
                handleBlur(): void {}
            }

            expect(getEventBindings(MultiLabel)).toEqual(
                new Map([
                    ['handleClick', 'click'],
                    ['handleBlur', 'blur'],
                ])
            );
        });
    });

    describe('behavior attachment', () => {
        it('@onEvent adds EventBehavior to component on construction', () => {
            class DecoratedLabel extends Label<string> {
                @onEvent('click')
                handleClick(): void {}
            }

            const instance = new DecoratedLabel('label');
            const behaviors = instance.behaviors.filter((behavior) => behavior instanceof EventBehavior);

            expect(behaviors).toHaveLength(1);
            expect((behaviors[0] as EventBehavior).eventName).toBe('click');
        });

        it('@onEvent adds multiple behaviors for multiple decorated methods', () => {
            class MultiLabel extends Label<string> {
                @onEvent('click')
                handleClick(): void {}

                @onEvent('blur')
                handleBlur(): void {}
            }

            const instance = new MultiLabel('label');
            const behaviors = instance.behaviors.filter((behavior) => behavior instanceof EventBehavior);
            const eventNames = behaviors.map((behavior) => (behavior as EventBehavior).eventName);

            expect(behaviors).toHaveLength(2);
            expect(eventNames).toEqual(['click', 'blur']);
        });

        it('@onEvent behavior invokes the decorated method when event fires', () => {
            class DecoratedLabel extends Label<string> {
                handleClickSpy = vi.fn();

                @onEvent('click')
                handleClick(event?: Event): void {
                    this.handleClickSpy(event);
                }
            }

            const dom = new LinkedomDOMProvider();
            const container = dom.createElement('span');
            const instance = new DecoratedLabel('label', new StaticModel('Hello'));

            instance.renderComponent(dom, container);
            container.dispatchEvent(createDomEvent(container, 'click'));

            expect(instance.handleClickSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('integration', () => {
        it('@onEvent decorated method receives the Event object', () => {
            class DecoratedLabel extends Label<string> {
                handleClickSpy = vi.fn();

                @onEvent('click')
                handleClick(event?: Event): void {
                    this.handleClickSpy(event);
                }
            }

            const dom = new LinkedomDOMProvider();
            const container = dom.createElement('span');
            const instance = new DecoratedLabel('label', new StaticModel('Hello'));
            const event = createDomEvent(container, 'click');

            instance.renderComponent(dom, container);
            container.dispatchEvent(event);

            expect(instance.handleClickSpy).toHaveBeenCalledWith(event);
        });
    });
});
