/**
 * @author Jeff Rose
 */
import type { Behavior } from './behavior';

/**
 * Callback invoked when the DOM event fires.
 */
export type EventBehaviorHandler = (event?: Event) => void | Promise<void>;

/**
 * A behavior that binds a DOM event listener to the host component's
 * rendered element. When the event fires, the handler is invoked.
 *
 * Inspired by Wicket's event behavior pattern, this behavior attaches
 * a DOM event listener and invokes a local handler function when the
 * event fires.
 */
export class EventBehavior implements Behavior {
    #eventName: string;
    #handler: EventBehaviorHandler;
    #listener: EventListener | null = null;
    #element: Element | null = null;

    get [Symbol.toStringTag](): string {
        return 'EventBehavior';
    }

    /**
     * The DOM event name this behavior listens for.
     */
    get eventName(): string {
        return this.#eventName;
    }

    /**
     * Creates an event behavior.
     *
     * @param eventName - The DOM event to listen for (e.g., `'click'`, `'submit'`).
     * @param handler - The callback invoked when the event fires.
     */
    constructor(eventName: string, handler: EventBehaviorHandler) {
        this.#eventName = eventName;
        this.#handler = handler;
    }

    /**
     * Attaches the event listener after the component renders.
     * Looks for the component's element reference.
     *
     * @param component - The host component.
     */
    afterRender(component: unknown): void {
        const comp = component as { _element?: Element };

        if (!comp._element) {
            return;
        }

        this.#attach(comp._element);
    }

    /**
     * Removes the event listener when the component detaches.
     */
    detach(): void {
        this.#detachListener();
    }

    /**
     * Removes the event listener when the behavior is unbound.
     */
    unbind(): void {
        this.#detachListener();
    }

    /**
     * Attaches the event listener to the given element.
     *
     * @param element - The DOM element to bind to.
     */
    attachTo(element: Element): void {
        this.#attach(element);
    }

    #attach(element: Element): void {
        this.#detachListener();
        this.#element = element;
        this.#listener = ((event: Event) => {
            this.#handler(event);
        }) as EventListener;
        element.addEventListener(this.#eventName, this.#listener);
    }

    #detachListener(): void {
        if (this.#element && this.#listener) {
            this.#element.removeEventListener(this.#eventName, this.#listener);
            this.#listener = null;
            this.#element = null;
        }
    }
}
