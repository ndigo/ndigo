/**
 * @author Jeff Rose
 */

/**
 * Utility for managing DOM event listeners on a specific element.
 * 
 * Ensures that listeners are tracked and can be removed in bulk,
 * preventing memory leaks and duplicate listeners.
 */
export class DOMEventBinder {
    #element: HTMLElement;
    #listeners: Map<string, EventListener> = new Map();

    /**
     * Creates a binder for the specified element.
     * 
     * @param element - The element to bind events to.
     */
    constructor(element: HTMLElement) {
        this.#element = element;
    }

    /**
     * Binds a listener to a DOM event.
     * 
     * @param eventName - The name of the DOM event (e.g., 'click').
     * @param handler - The listener function.
     */
    bind(eventName: string, handler: EventListener): void {
        this.#element.addEventListener(eventName, handler);
        this.#listeners.set(eventName, handler);
    }

    /**
     * Removes a specific listener from a DOM event.
     * 
     * @param eventName - The name of the DOM event.
     */
    unbind(eventName: string): void {
        const handler = this.#listeners.get(eventName);
        if (handler) {
            this.#element.removeEventListener(eventName, handler);
            this.#listeners.delete(eventName);
        }
    }

    /**
     * Removes all listeners managed by this binder.
     */
    unbindAll(): void {
        this.#listeners.forEach((handler, eventName) => {
            this.#element.removeEventListener(eventName, handler);
        });
        this.#listeners.clear();
    }
}
