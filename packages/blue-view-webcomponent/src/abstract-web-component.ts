/**
 * @author Jeff Rose
 */

import { EventEmitter, EventType, EventHandlers, ApplicationContext, ApplicationContextAware } from '@blue/context';
import { $aware } from '@blue/factory';
import { AsBlueElement } from './blue-element';
import { DOMEventBinder } from './_dom-event-binder';

/**
 * Base class for BlueJS custom elements.
 *
 * Provides a DOM-backed implementation of the EventEmitter interface,
 * batched rendering, and lifecycle hooks.
 */
export abstract class AbstractWebComponent
    extends AsBlueElement(HTMLElement)
    implements EventEmitter, ApplicationContextAware
{
    readonly [$aware] = true;
    #wrappedListeners: Map<string, Map<Function, EventListener>> = new Map();
    #eventDelegation: Map<string, Map<string, string>> = new Map();
    #updatePending: boolean = false;
    #applicationContext?: ApplicationContext;
    #binder: DOMEventBinder;

    constructor() {
        super();
        this.#binder = new DOMEventBinder(this);
        this.#setupDelegation();
    }

    /**
     * Set the ApplicationContext that this object runs in.
     *
     * @param applicationContext - The ApplicationContext to be used by this object.
     */
    setApplicationContext(applicationContext: ApplicationContext): void {
        this.#applicationContext = applicationContext;
    }

    /**
     * Retrieves the ApplicationContext associated with this component.
     */
    get applicationContext(): ApplicationContext {
        if (!this.#applicationContext) {
            throw new Error('ApplicationContext has not been set for this AbstractWebComponent.');
        }
        return this.#applicationContext;
    }

    /**
     * Sets up the root event listeners for delegation.
     */
    #setupDelegation(): void {
        // We don't know the events yet, so we'll add listeners dynamically
        // in on() if they aren't already present.
    }

    /**
     * Binds DOM events to class methods using event delegation.
     *
     * This is a convenience wrapper around the `on` method.
     *
     * @param mapping - A mapping of selectors or 'event selector' to method names.
     * Example: { '.btn': 'handleBtn', 'change .input': 'handleInput' }
     */
    bindEvents(mapping: Record<string, string>): void {
        for (const [key, methodName] of Object.entries(mapping)) {
            this.on(key, methodName);
        }
    }

    /**
     * Dispatches a delegated event to the appropriate method.
     */
    #dispatchDelegatedEvent(event: Event): void {
        const eventType = event.type;
        const typeMap = this.#eventDelegation.get(eventType);

        if (!typeMap) return;

        for (const [selector, methodName] of typeMap.entries()) {
            const target = (event.target as HTMLElement).closest(selector);
            if (target && this.contains(target)) {
                const method = (this as any)[methodName];
                if (typeof method === 'function') {
                    method.call(this, event);
                }
                // Only one selector should match per event to avoid multiple triggers
                break;
            }
        }
    }

    /**
     * Emits an event to the listeners registered for the given type.
     *
     * This implementation uses native DOM CustomEvents to ensure bubbling.
     *
     * @param type - The event type.
     * @param data - Event payload values.
     * @returns `true` when the event was dispatched.
     */
    emit(type: EventType, ...data: any[]): boolean {
        const event = new CustomEvent(type.toString(), {
            detail: data.length === 1 ? data[0] : data,
            bubbles: true,
            composed: true,
        });
        return this.dispatchEvent(event);
    }

    /**
     * Adds a listener for an event type.
     *
     * Supports both standard event types and delegated selectors.
     * If the type contains a space (e.g., 'click .btn'), it is treated as a delegated event.
     *
     * @param type - The event type or a mapping of event types to handlers.
     * @param listener - The listener to register.
     * @returns This component.
     */
    on(type: EventType | EventHandlers | string, listener?: Function | string): this {
        if (typeof type === 'object' && type !== null) {
            const handlers = type as EventHandlers;
            for (const eventType in handlers) {
                const handler = handlers[eventType];
                if (Array.isArray(handler)) {
                    handler.forEach((h) => this.on(eventType, h));
                } else {
                    this.on(eventType, handler);
                }
            }
            return this;
        }

        const typeStr = type.toString();

        // Handle delegated events (e.g., 'click .btn')
        if (typeStr.includes(' ')) {
            const [eventType, ...selParts] = typeStr.split(' ');
            const selector = selParts.join(' ');
            const methodName = listener as string;

            if (typeof methodName !== 'string') {
                throw new TypeError('Delegated listeners must be provided as method names (strings).');
            }

            let typeMap = this.#eventDelegation.get(eventType);
            if (!typeMap) {
                typeMap = new Map();
                this.#eventDelegation.set(eventType, typeMap);

                this.#binder.bind(eventType, (event: Event) => {
                    this.#dispatchDelegatedEvent(event);
                });
            }

            typeMap.set(selector, methodName);
            return this;
        }

        // Handle standard event subscriptions
        const actualListener = (event: Event) => {
            if (event instanceof CustomEvent) {
                (listener as Function)?.(event.detail);
            } else {
                (listener as Function)?.(event);
            }
        };

        let typeMap = this.#wrappedListeners.get(typeStr);
        if (!typeMap) {
            typeMap = new Map();
            this.#wrappedListeners.set(typeStr, typeMap);
        }
        typeMap.set(listener as Function, actualListener);

        this.addEventListener(typeStr, actualListener);
        return this;
    }

    /**
     * Removes a listener for an event type.
     *
     * @param type - The event type.
     * @param listener - The listener to remove.
     * @returns This component.
     */
    off(type: EventType | string, listener: Function | string): this {
        const typeStr = type.toString();

        // Handle delegated event removal
        if (typeStr.includes(' ')) {
            const [eventType, ...selParts] = typeStr.split(' ');
            const selector = selParts.join(' ');
            const typeMap = this.#eventDelegation.get(eventType);
            if (typeMap) {
                typeMap.delete(selector);
            }
            return this;
        }

        // Handle standard event removal
        const typeMap = this.#wrappedListeners.get(typeStr);
        if (typeMap && typeMap.has(listener as Function)) {
            const wrapped = typeMap.get(listener as Function)!;
            this.removeEventListener(typeStr, wrapped);
            typeMap.delete(listener as Function);

            if (typeMap.size === 0) {
                this.#wrappedListeners.delete(typeStr);
            }
        }

        return this;
    }

    /**
     * Returns the event types with registered listeners.
     */
    eventTypes(): EventType[] {
        return Array.from(this.#wrappedListeners.keys());
    }

    /**
     * Returns the number of listeners for a type.
     */
    listenerCount(type: EventType): number {
        const typeMap = this.#wrappedListeners.get(type.toString());
        return typeMap ? typeMap.size : 0;
    }

    /**
     * Returns a snapshot of listeners for a type.
     */
    listeners(type: EventType): Function[] {
        const typeMap = this.#wrappedListeners.get(type.toString());
        return typeMap ? Array.from(typeMap.keys()) : [];
    }

    /**
     * Shorthand for querySelector.
     *
     * @param selector - The CSS selector to search for.
     * @returns The first matching element, or null if none found.
     */
    select(selector: string): Element | null {
        return this.querySelector(selector);
    }

    /**
     * Creates a DOM element with the specified properties.
     *
     * @param tag - The HTML tag name.
     * @param props - A record of properties to apply to the element.
     * @returns The created HTMLElement.
     */
    create(tag: string, props: Record<string, any> = {}): HTMLElement {
        const element = document.createElement(tag);

        for (const [key, value] of Object.entries(props)) {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'id') {
                element.id = value;
            } else {
                element.setAttribute(key, value);
            }
        }

        return element;
    }

    /**
     * Schedules a render pass on the next animation frame.
     */
    requestUpdate(): void {
        if (this.#updatePending) {
            return;
        }
        this.#updatePending = true;
        requestAnimationFrame(() => {
            this.#updatePending = false;
            this.render();
        });
    }

    connectedCallback(): void {
        this.emit('connect');
        this.handleConnect();
    }

    disconnectedCallback(): void {
        this.#binder.unbindAll();
        this.emit('disconnect');
        this.handleDisconnect();
    }

    /**
     * Lifecycle hook called when the component is added to the DOM.
     */
    protected handleConnect(): void {
        // To be implemented by subclasses
    }

    /**
     * Lifecycle hook called when the component is removed from the DOM.
     */
    protected handleDisconnect(): void {
        // To be implemented by subclasses
    }

    /**
     * Renders the component's UI.
     *
     * This method must be implemented by subclasses to define the DOM structure.
     */
    abstract render(): void;
}
