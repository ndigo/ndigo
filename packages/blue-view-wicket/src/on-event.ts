/**
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getSymbolMetadata } from '@blue/core';
import { EventBehavior } from './event-behavior';

const ON_EVENT_METADATA_PREFIX = 'wicket:onEvent:';

/**
 * Declares a DOM event binding for a component method.
 *
 * The decorator stores metadata and registers an initializer that adds
 * an {@link EventBehavior} instance at component construction time.
 *
 * @param eventName - DOM event name (for example, `'click'` or `'submit'`).
 * @returns A method decorator that binds the event to the method.
 */
export function onEvent(eventName: string) {
    return function (target: any, context: ClassMethodDecoratorContext): void {
        context.metadata[`${ON_EVENT_METADATA_PREFIX}${String(context.name)}`] = eventName;

        context.addInitializer(function (this: any) {
            this.addBehavior(new EventBehavior(eventName, (event?: Event) => target.call(this, event)));
        });
    };
}

/**
 * Reads event-binding metadata for a class or instance.
 *
 * @param target - Class constructor or instance.
 * @returns Map of method names to DOM event names.
 */
export function getEventBindings(target: any): Map<string, string> {
    const metadata = getSymbolMetadata(target);
    const bindings = new Map<string, string>();

    for (const key in metadata) {
        if (!key.startsWith(ON_EVENT_METADATA_PREFIX)) {
            continue;
        }

        const methodName = key.slice(ON_EVENT_METADATA_PREFIX.length);
        const mappedEventName = metadata[key];

        if (typeof mappedEventName === 'string') {
            bindings.set(methodName, mappedEventName);
        }
    }

    return bindings;
}

/**
 * Checks whether a class or instance has any `@onEvent` bindings.
 *
 * @param target - Class constructor or instance.
 * @returns `true` when at least one event binding exists.
 */
export function hasEventBindings(target: any): boolean {
    return getEventBindings(target).size > 0;
}
