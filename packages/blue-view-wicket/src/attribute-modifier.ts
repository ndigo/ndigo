/**
 * @author Jeff Rose
 */
import type { Behavior } from './behavior';

/**
 * A behavior that modifies a DOM attribute on the host component's
 * rendered element during the afterRender phase.
 *
 * Typical usage: adding `class`, `style`, `title`, `data-*` attributes.
 */
export class AttributeModifier implements Behavior {
    #attribute: string;
    #value: string | ((current: string | null) => string | null);

    get [Symbol.toStringTag](): string {
        return 'AttributeModifier';
    }

    /**
     * The attribute name this modifier targets.
     */
    get attribute(): string {
        return this.#attribute;
    }

    /**
     * Creates an attribute modifier.
     *
     * @param attribute - The name of the HTML attribute to modify.
     * @param value - A static string value, or a function that receives
     *   the current attribute value and returns the new value (or `null` to remove).
     */
    constructor(attribute: string, value: string | ((current: string | null) => string | null)) {
        this.#attribute = attribute;
        this.#value = value;
    }

    /**
     * Applies the attribute modification after the component renders.
     * Looks for the component's rendered element by its element reference.
     *
     * @param component - The host component (expects an optional `_element` property).
     */
    afterRender(component: unknown): void {
        const comp = component as { _element?: Element };

        if (!comp._element) {
            return;
        }

        this.#applyTo(comp._element);
    }

    /**
     * Applies the attribute change to the given element.
     *
     * @param element - The DOM element to modify.
     */
    applyTo(element: Element): void {
        this.#applyTo(element);
    }

    #applyTo(element: Element): void {
        if (typeof this.#value === 'function') {
            const current = element.getAttribute(this.#attribute);
            const next = this.#value(current);

            if (next === null) {
                element.removeAttribute(this.#attribute);
            } else {
                element.setAttribute(this.#attribute, next);
            }

            return;
        }

        element.setAttribute(this.#attribute, this.#value);
    }
}

/**
 * A specialized {@link AttributeModifier} that appends a CSS class
 * to the element's `class` attribute without replacing existing classes.
 */
export class CSSClassAppender implements Behavior {
    #className: string;

    get [Symbol.toStringTag](): string {
        return 'CSSClassAppender';
    }

    /**
     * The CSS class name to append.
     */
    get className(): string {
        return this.#className;
    }

    /**
     * Creates a class appender for the given CSS class.
     *
     * @param className - The CSS class to add.
     */
    constructor(className: string) {
        this.#className = className;
    }

    /**
     * Appends the CSS class after the component renders.
     *
     * @param component - The host component.
     */
    afterRender(component: unknown): void {
        const comp = component as { _element?: Element };

        if (!comp._element) {
            return;
        }

        this.applyTo(comp._element);
    }

    /**
     * Appends the CSS class to the given element.
     *
     * @param element - The DOM element to modify.
     */
    applyTo(element: Element): void {
        const current = element.getAttribute('class');

        if (!current) {
            element.setAttribute('class', this.#className);
            return;
        }

        if (!current.split(/\s+/).includes(this.#className)) {
            element.setAttribute('class', `${current} ${this.#className}`);
        }
    }
}
