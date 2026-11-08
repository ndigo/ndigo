/**
 * Base class for Ndigo custom elements with event delegation and lifecycle hooks.
 */
import { EventEmitter, EventType, EventHandlers, ApplicationContext, ApplicationContextAware } from '@ndigo/context';
import { IllegalStateError } from '@ndigo/core';
import { $aware } from '@ndigo/factory';
import { AsNdigoElement } from './ndigo-element';
import { DOMEventBinder } from './_dom-event-binder';

/**
 * Base class for Ndigo custom elements.
 *
 * Provides a DOM-backed implementation of the EventEmitter interface,
 * batched rendering, and lifecycle hooks.
 */
export abstract class AbstractWebComponent
    extends AsNdigoElement(HTMLElement)
    implements EventEmitter, ApplicationContextAware
{
    readonly [$aware] = true;
    #wrappedListeners: Map<string, Map<Function, EventListener>> = new Map();
    #eventDelegation: Map<string, Map<string, string>> = new Map();
    #updatePending: boolean = false;
    #applicationContext?: ApplicationContext;
    #binder: DOMEventBinder;

    /**
     * The shadow root this component acquired (via {@link ensureShadowRoot}),
     * cached so a **closed** root — which `this.shadowRoot` cannot expose —
     * is still returned on a second call instead of re-attaching (WC-C).
     */
    #shadowRoot?: ShadowRoot;

    /**
     * Shared root listener for every delegated event type.
     *
     * A single stable function reference keeps binding idempotent: the DOM
     * ignores a duplicate listener with the same type and callback, so
     * re-attaching it never stacks a second dispatch.
     */
    #handleDelegatedEvent = (event: Event): void => {
        this.#dispatchDelegatedEvent(event);
    };

    constructor() {
        super();
        this.#binder = new DOMEventBinder(this);
    }

    /**
     * Re-attaches the root listeners for all registered delegated event types.
     */
    #bindDelegatedEvents(): void {
        for (const eventType of this.#eventDelegation.keys()) {
            this.#binder.bind(eventType, this.#handleDelegatedEvent);
        }
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
     * Binds DOM events to class methods using event delegation.
     *
     * This is a convenience wrapper around the `on` method.
     *
     * @param mapping - A mapping of selectors or 'event selector' to method names.
     * Example: `.btn` to `handleBtn`, `change .input` to `handleInput`.
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
                const method = (this as Record<string, unknown>)[methodName];
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
    emit(type: EventType, ...data: unknown[]): boolean {
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

                this.#binder.bind(eventType, this.#handleDelegatedEvent);
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
        // Registering the same listener twice must be idempotent: the
        // wrapped-listeners map and the DOM listener stay in sync, so a
        // duplicate registration is a no-op instead of stacking a second DOM
        // listener (which would fire the handler once per registration).
        if (typeMap.has(listener as Function)) return this;
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
            const wrapped = typeMap.get(listener as Function);
            if (wrapped) {
                this.removeEventListener(typeStr, wrapped);
            }
            typeMap.delete(listener as Function);

            if (typeMap.size === 0) {
                this.#wrappedListeners.delete(typeStr);
            }
        }

        return this;
    }

    /**
     * Returns the event types with registered listeners.
     *
     * @returns The event types that currently have listeners.
     */
    eventTypes(): EventType[] {
        return Array.from(this.#wrappedListeners.keys());
    }

    /**
     * Returns the number of listeners for a type.
     *
     * @param type - The event type to inspect.
     * @returns The number of registered listeners.
     */
    listenerCount(type: EventType): number {
        const typeMap = this.#wrappedListeners.get(type.toString());
        return typeMap ? typeMap.size : 0;
    }

    /**
     * Returns a snapshot of listeners for a type.
     *
     * @param type - The event type to inspect.
     * @returns The listeners registered for `type`.
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
    create(tag: string, props: Record<string, unknown> = {}): HTMLElement {
        const element = document.createElement(tag);

        for (const [key, value] of Object.entries(props)) {
            if (key === 'className') {
                element.className = String(value);
            } else if (key === 'textContent') {
                element.textContent = String(value);
            } else if (key === 'id') {
                element.id = String(value);
            } else {
                element.setAttribute(key, String(value));
            }
        }

        return element;
    }

    /**
     * Acquires the component's shadow root, attaching one only when none
     * exists yet.
     *
     * Components that render into a shadow root MUST acquire it through this
     * helper rather than a bare `attachShadow()`: Declarative Shadow DOM
     * (DSD) makes the HTML parser create a real shadow root from a
     * server-rendered `<template shadowrootmode>` *before* the element is
     * defined, so an upgrade-time `attachShadow()` would otherwise throw
     * "shadow root already exists". When a root is already present it is
     * adopted as-is (the component's first render then replaces the
     * server-rendered fallback content); otherwise a root is attached.
     *
     * The acquired root is cached in a private field (WC-C), so the round trip
     * is stable even for a **closed** root: `this.shadowRoot` is `null` for a
     * closed root, so a second `attachShadow()` would throw instead of
     * returning it. A closed root attached *outside* this helper stays
     * invisible to the component (the DOM exposes no read access to it) and
     * therefore cannot be adopted.
     *
     * @param init - Shadow root options; defaults to `{ mode: 'open' }`.
     * @returns The existing or newly attached shadow root.
     * @throws When a root already exists with a mode other
     *   than the requested one — an attached root's mode cannot change, so
     *   silently returning it would hide the mismatch.
     */
    protected ensureShadowRoot(init: ShadowRootInit = { mode: 'open' }): ShadowRoot {
        const root = this.#shadowRoot ?? this.shadowRoot;
        if (root) {
            if (root.mode !== init.mode) {
                throw new IllegalStateError(
                    `Cannot reuse the existing ${root.mode} shadow root for a ${init.mode} request on <${this.tagName.toLowerCase()}>`
                );
            }
            this.#shadowRoot = root;
            return root;
        }
        const attached = this.attachShadow(init);
        this.#shadowRoot = attached;
        return attached;
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

    /**
     * Re-binds delegated listeners and emits `connect` after a reconnect.
     */
    connectedCallback(): void {
        // disconnectedCallback() unbinds every DOM listener; re-attach the
        // delegated root listeners so delegation survives a reconnect.
        this.#bindDelegatedEvents();
        this.emit('connect');
        this.handleConnect();
    }

    /**
     * Unbinds delegated listeners and emits `disconnect`.
     */
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
