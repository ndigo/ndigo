/**
 * Small DOM construction helpers shared by the web-component views.
 *
 * Views build their subtrees with these instead of `innerHTML`: every value
 * (article titles, bios, comment bodies, error messages) is written through
 * `textContent`, so user-supplied text is never parsed as markup. The single
 * exception is the article body, which goes through
 * {@link renderMarkdown} — an escaping-by-default renderer (see that module).
 *

 */
import type { ConduitErrors } from './api/conduit-types';

/** Options accepted by {@link create}. */
export interface CreateOptions {
    /** The element's `class` attribute. */
    className?: string;
    /** The element's text content (never parsed as HTML). */
    text?: string;
    /** Attributes to set (boolean `true` sets an empty attribute, `false`/`null` skips). */
    attrs?: Record<string, string | number | boolean | null | undefined>;
    /** Child nodes; `null`/`undefined` entries are skipped. */
    children?: (Node | null | undefined)[];
    /** Event listeners, keyed by event type. */
    on?: Record<string, EventListener>;
}

/**
 * Creates an element, applies its options, and appends its children.
 *
 * @param tag - The tag name.
 * @param options - Class, text, attributes, children, and listeners.
 * @returns The constructed element.
 */
export function create<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: CreateOptions = {}
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);

    if (options.className !== undefined) {
        element.className = options.className;
    }
    if (options.text !== undefined) {
        element.textContent = options.text;
    }

    for (const [name, value] of Object.entries(options.attrs ?? {})) {
        if (value === null || value === undefined || value === false) {
            continue;
        }
        element.setAttribute(name, value === true ? '' : String(value));
    }

    for (const [event, listener] of Object.entries(options.on ?? {})) {
        element.addEventListener(event, listener);
    }

    const children = options.children ?? [];
    element.append(...children.filter((child): child is Node => child !== null && child !== undefined));
    return element;
}

/**
 * Builds an anchor. The caller passes a hash href (`#/login`) — the app is
 * hash-routed, so a plain anchor is a real navigation.
 *
 * @param href - The target href.
 * @param label - The link text.
 * @param className - Optional class.
 * @returns The anchor element.
 */
export function link(href: string, label: string, className?: string): HTMLAnchorElement {
    const anchor = create('a', { text: label });
    anchor.href = href;
    if (className !== undefined) {
        anchor.className = className;
    }
    return anchor;
}

/**
 * Builds the round author avatar (image when the profile has one, initials
 * otherwise).
 *
 * @param image - The profile image URL, if any.
 * @param username - The fallback initials source.
 * @returns The avatar element.
 */
export function avatar(image: string | null, username: string): HTMLElement {
    const wrapper = create('span', { className: 'avatar', attrs: { title: username } });
    if (image) {
        const img = create('img', { attrs: { src: image, alt: username, loading: 'lazy' } });
        wrapper.append(img);
    } else {
        wrapper.textContent = username.slice(0, 2).toUpperCase();
    }
    return wrapper;
}

/**
 * Renders the messages a field failed with, or nothing when it passed.
 *
 * @param errors - The RealWorld envelope.
 * @param field - The envelope key for this field.
 * @returns A `<p class="field-error">`, or `null` when the field has no error.
 */
export function fieldError(errors: ConduitErrors | null, field: string): HTMLElement | null {
    const messages = errors?.[field];
    if (!messages || messages.length === 0) {
        return null;
    }
    return create('p', { className: 'field-error', text: messages.join(', ') });
}

/**
 * Options for {@link textField}.
 */
export interface TextFieldOptions {
    /** The input's `name` (also its id). */
    name: string;
    /** The visible label. */
    label: string;
    /** The current value. */
    value?: string;
    /** An `input` type (`text` by default). */
    type?: string;
    /** Multi-line fields render a textarea instead of an input. */
    multiline?: boolean;
    /** Placeholder text. */
    placeholder?: string;
    /** Per-field messages from the API envelope. */
    errors?: ConduitErrors | null;
    /** Called with the field's current value on every input event. */
    onInput?: (value: string) => void;
}

/**
 * Builds a labeled form field with its API-supplied error message underneath.
 *
 * @param options - The field's label, value, type, errors, and input handler.
 * @returns The `<div class="field">` wrapper.
 */
export function textField(options: TextFieldOptions): HTMLElement {
    const input = options.multiline
        ? create('textarea', { attrs: { id: options.name, name: options.name, placeholder: options.placeholder } })
        : create('input', {
              attrs: { id: options.name, name: options.name, type: options.type ?? 'text', placeholder: options.placeholder },
          });

    input.value = options.value ?? '';
    if (options.onInput) {
        input.addEventListener('input', () => options.onInput?.(input.value));
    }

    return create('div', {
        className: 'field',
        children: [
            create('label', { text: options.label, attrs: { for: options.name } }),
            input,
            fieldError(options.errors ?? null, options.name),
        ],
    });
}
